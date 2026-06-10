/*
 * pylibavoid - Python bindings for libavoid via pybind11
 *
 * Exposes core libavoid API: Router, ShapeRef, ConnRef, Point, Polygon, etc.
 *
 * Ownership model: Router owns all ShapeRef/ConnRef/JunctionRef objects.
 * We use py::nodelete holder so Python never calls destructors on these objects.
 * Only Router::deleteShape/deleteConnector or Router destruction cleans them up.
 */
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/operators.h>

#include "libavoid/router.h"
#include "libavoid/connector.h"
#include "libavoid/shape.h"
#include "libavoid/geometry.h"
#include "libavoid/connend.h"
#include "libavoid/junction.h"
#include "libavoid/viscluster.h"

namespace py = pybind11;

using namespace Avoid;

/* ------------------------------------------------------------------ */
/*  Helper: convert PolyLine/Polygon -> list of (x, y) tuples for Python  */
/* ------------------------------------------------------------------ */
static py::tuple point_to_tuple(const Point &p) {
    return py::make_tuple(p.x, p.y);
}

static py::list polygon_to_list(const Polygon &poly) {
    py::list result;
    for (size_t i = 0; i < poly.size(); ++i) {
        result.append(point_to_tuple(poly.ps[i]));
    }
    return result;
}

static py::list connref_display_route(ConnRef *conn) {
    return polygon_to_list(conn->displayRoute());
}

static py::list connref_route(ConnRef *conn) {
    return polygon_to_list(conn->route());
}

/* ------------------------------------------------------------------ */
/*  Custom no-op holder — prevents pybind11 from calling delete         */
/*  on objects owned by the Router                                      */
/* ------------------------------------------------------------------ */
template <typename T>
struct router_owned {
    void operator()(T *obj) const {
        // No-op: Router owns this object and will clean it up via
        // deleteShape / deleteConnector / or Router destructor
        (void)obj;
    }
};

PYBIND11_MODULE(pylibavoid, m) {
    m.doc() = "libavoid Python bindings - Fast obstacle-avoiding connector routing";

    /* =============================================================== */
    /*  Enums                                                            */
    /* =============================================================== */

    py::enum_<RouterFlag>(m, "RouterFlag")
        .value("PolyLineRouting", PolyLineRouting)
        .value("OrthogonalRouting", OrthogonalRouting)
        .export_values();

    py::enum_<ConnType>(m, "ConnType")
        .value("None", ConnType_None)
        .value("PolyLine", ConnType_PolyLine)
        .value("Orthogonal", ConnType_Orthogonal)
        .export_values();

    py::enum_<RoutingParameter>(m, "RoutingParameter")
        .value("segmentPenalty", segmentPenalty)
        .value("anglePenalty", anglePenalty)
        .value("crossingPenalty", crossingPenalty)
        .value("clusterCrossingPenalty", clusterCrossingPenalty)
        .value("fixedSharedPathPenalty", fixedSharedPathPenalty)
        .value("portDirectionPenalty", portDirectionPenalty)
        .value("shapeBufferDistance", shapeBufferDistance)
        .value("idealNudgingDistance", idealNudgingDistance)
        .value("reverseDirectionPenalty", reverseDirectionPenalty)
        .export_values();

    py::enum_<RoutingOption>(m, "RoutingOption")
        .value("nudgeOrthogonalSegmentsConnectedToShapes",
               nudgeOrthogonalSegmentsConnectedToShapes)
        .value("improveHyperedgeRoutesMovingJunctions",
               improveHyperedgeRoutesMovingJunctions)
        .value("penaliseOrthogonalSharedPathsAtConnEnds",
               penaliseOrthogonalSharedPathsAtConnEnds)
        .value("nudgeOrthogonalTouchingColinearSegments",
               nudgeOrthogonalTouchingColinearSegments)
        .value("performUnifyingNudgingPreprocessingStep",
               performUnifyingNudgingPreprocessingStep)
        .value("improveHyperedgeRoutesMovingAddingAndDeletingJunctions",
               improveHyperedgeRoutesMovingAddingAndDeletingJunctions)
        .value("nudgeSharedPathsWithCommonEndPoint",
               nudgeSharedPathsWithCommonEndPoint)
        .export_values();

    /* =============================================================== */
    /*  Point                                                            */
    /* =============================================================== */
    py::class_<Point>(m, "Point")
        .def(py::init<double, double>(), py::arg("x") = 0.0, py::arg("y") = 0.0)
        .def_readwrite("x", &Point::x)
        .def_readwrite("y", &Point::y)
        .def("__repr__", [](const Point &p) {
            return "Point(" + std::to_string(p.x) + ", " + std::to_string(p.y) + ")";
        })
        .def(py::self == py::self)
        .def(py::self != py::self)
        .def(py::self + py::self)
        .def(py::self - py::self);

    /* =============================================================== */
    /*  Polygon                                                          */
    /* =============================================================== */
    py::class_<Polygon>(m, "Polygon")
        .def(py::init<int>(), py::arg("n") = 0)
        .def("clear", &Polygon::clear)
        .def("empty", &Polygon::empty)
        .def("size", &Polygon::size)
        .def("set_point", &Polygon::setPoint,
             py::arg("index"), py::arg("point"))
        .def("get_point", [](const Polygon &poly, size_t idx) {
            return point_to_tuple(poly.at(idx));
        }, py::arg("index"))
        .def("simplify", &Polygon::simplify)
        .def("translate", &Polygon::translate,
             py::arg("xDist"), py::arg("yDist"))
        .def_property_readonly("points", &polygon_to_list);

    /* =============================================================== */
    /*  Rectangle (subclass of Polygon)                                   */
    /* =============================================================== */
    py::class_<Rectangle, Polygon>(m, "Rectangle")
        .def(py::init<Point, Point>(), py::arg("topLeft"), py::arg("bottomRight"))
        .def(py::init<Point, double, double>(),
             py::arg("centre"), py::arg("width"), py::arg("height"));

    /* =============================================================== */
    /*  Router                                                           */
    /* =============================================================== */
    py::class_<Router, std::unique_ptr<Router, router_owned<Router>>>(m, "Router")
        .def(py::init([](unsigned int flags) -> Router * {
            return new Router(flags);
        }), py::arg("flags") =
             (unsigned int)(OrthogonalRouting | PolyLineRouting))

        // Transaction management
        .def("set_transaction_use", &Router::setTransactionUse,
             py::arg("transactions"))
        .def("transaction_use", &Router::transactionUse)
        .def("process_transaction", &Router::processTransaction)

        // Shape management
        .def("delete_shape", &Router::deleteShape,
             py::arg("shape"))
        .def("move_shape", (void (Router::*)(ShapeRef *, const Polygon &, bool))
                                &Router::moveShape,
             py::arg("shape"), py::arg("newPoly"),
             py::arg("first_move") = false)
        .def("move_shape", (void (Router::*)(ShapeRef *, const double, const double))
                                &Router::moveShape,
             py::arg("shape"), py::arg("xDiff"), py::arg("yDiff"))

        // Connector management
        .def("delete_connector", &Router::deleteConnector,
             py::arg("connector"))

        // Junction management
        .def("delete_junction", &Router::deleteJunction,
             py::arg("junction"))
        .def("move_junction", (void (Router::*)(JunctionRef *, const Point &))
                                  &Router::moveJunction,
             py::arg("junction"), py::arg("newPosition"))
        .def("move_junction", (void (Router::*)(JunctionRef *, const double, const double))
                                  &Router::moveJunction,
             py::arg("junction"), py::arg("xDiff"), py::arg("yDiff"))

        // Routing parameters
        .def("set_routing_parameter", &Router::setRoutingParameter,
             py::arg("parameter"), py::arg("value") = chooseSensibleParamValue)
        .def("routing_parameter", &Router::routingParameter)
        .def("set_routing_option", &Router::setRoutingOption,
             py::arg("option"), py::arg("value"))
        .def("routing_option", &Router::routingOption)
        .def("set_routing_penalty", &Router::setRoutingPenalty,
             py::arg("penType"), py::arg("penVal") = chooseSensibleParamValue)

        // Convenience: add a rectangle shape directly
        .def("add_rectangle", [](Router *router, double cx, double cy,
                                 double w, double h, unsigned int id) -> ShapeRef * {
            Point centre(cx, cy);
            Rectangle rect(centre, w, h);
            Polygon poly = static_cast<Polygon>(rect);
            return new ShapeRef(router, poly, id);
        }, py::arg("cx"), py::arg("cy"), py::arg("w"), py::arg("h"),
           py::arg("id") = 0)

        // Debug output
        .def("output_instance_to_svg", &Router::outputInstanceToSVG,
             py::arg("filename") = std::string());

    /* =============================================================== */
    /*  ShapeRef — owned by Router, use nodelete holder                  */
    /* =============================================================== */
    py::class_<ShapeRef, std::unique_ptr<ShapeRef, router_owned<ShapeRef>>>(
            m, "ShapeRef")
        .def(py::init([](Router *router, Polygon &poly, unsigned int id) -> ShapeRef * {
            return new ShapeRef(router, poly, id);
        }), py::arg("router"), py::arg("polygon"), py::arg("id") = 0)

        .def("polygon", &ShapeRef::polygon,
             py::return_value_policy::reference_internal)
        .def("position", &ShapeRef::position);

    /* =============================================================== */
    /*  ConnRef — owned by Router, use nodelete holder                   */
    /* =============================================================== */
    py::class_<ConnRef, std::unique_ptr<ConnRef, router_owned<ConnRef>>>(
            m, "ConnRef")
        // Basic constructor (no endpoints set yet)
        .def(py::init([](Router *router, unsigned int id) -> ConnRef * {
            return new ConnRef(router, id);
        }), py::arg("router"), py::arg("id") = 0)

        // Constructor with source/dest points
        .def(py::init([](Router *r, double x1, double y1,
                         double x2, double y2, unsigned int id) -> ConnRef * {
            return new ConnRef(r, ConnEnd(Point(x1, y1)),
                                 ConnEnd(Point(x2, y2)), id);
        }),
        py::arg("router"), py::arg("src_x"), py::arg("src_y"),
        py::arg("dst_x"), py::arg("dst_y"), py::arg("id") = 0)

        .def("set_endpoints", &ConnRef::setEndpoints)
        .def("set_source_endpoint", &ConnRef::setSourceEndpoint)
        .def("set_dest_endpoint", &ConnRef::setDestEndpoint)
        .def("id", &ConnRef::id)
        .def("needs_repaint", &ConnRef::needsRepaint)
        .def("display_route", &connref_display_route,
             "Get the display route as list of (x,y) tuples")
        .def("raw_route", &connref_route,
             "Get the raw debug route as list of (x,y) tuples")
        .def("set_routing_type", &ConnRef::setRoutingType)
        .def("routing_type", &ConnRef::routingType);

    /* =============================================================== */
    /*  JunctionRef — owned by Router, use nodelet holder                */
    /* =============================================================== */
    py::class_<JunctionRef, std::unique_ptr<JunctionRef, router_owned<JunctionRef>>>(
            m, "JunctionRef")
        .def(py::init([](Router *router, const Point &pt, unsigned int id) -> JunctionRef * {
            return new JunctionRef(router, pt, id);
        }), py::arg("router"), py::arg("position"), py::arg("id") = 0)

        .def("position", &JunctionRef::position,
             py::return_value_policy::copy);

    /* =============================================================== */
    /*  Module-level convenience functions                                 */
    /* =============================================================== */
    m.def("euclidean_dist", &euclideanDist,
          "Euclidean distance between two points");
    m.def("manhattan_dist", &manhattanDist,
          "Manhattan distance between two points");
}
