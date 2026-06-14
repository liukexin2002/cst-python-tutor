#!/usr/bin/env python3
"""
pylibavoid test script - demonstrates obstacle-avoiding orthogonal routing.

Usage:
    cd /workspace/pylibavoid/build && python3 ../test_pylibavoid.py
"""

import sys
sys.path.insert(0, ".")

import pylibavoid as avoid


def basic_orthogonal_routing():
    """Basic example: route a connector around rectangular obstacles."""
    print("=" * 60)
    print("Test 1: Basic Orthogonal Routing with Obstacle Avoidance")
    print("=" * 60)

    # Create router with orthogonal routing enabled
    router = avoid.Router(avoid.RouterFlag.OrthogonalRouting)

    # Set routing parameters for nicer output
    router.set_routing_parameter(avoid.RoutingParameter.segmentPenalty, 10)
    router.set_routing_parameter(avoid.RoutingParameter.shapeBufferDistance, 4.0)

    # Add obstacles (rectangular shapes representing nodes/components)
    shape1 = router.add_rectangle(200, 150, 80, 60, id=1)   # center node
    shape2 = router.add_rectangle(400, 300, 100, 40, id=2)  # bottom-right node

    print(f"  Added shape1 (obstacle) at center")
    print(f"  Added shape2 (obstacle) at lower-right")

    # Create a connector from top-left to bottom-right (must avoid shapes)
    conn = avoid.ConnRef(router, src_x=50, src_y=50, dst_x=500, dst_y=380, id=1)

    # Process the routing transaction
    router.process_transaction()

    # Get the routed path
    route = conn.display_route()
    print(f"\n  Connector route ({len(route)} points):")
    for i, (x, y) in enumerate(route):
        print(f"    [{i}] ({x:.1f}, {y:.1f})")

    raw = conn.raw_route()
    print(f"\n  Raw debug route ({len(raw)} points):")
    for i, (x, y) in enumerate(raw):
        print(f"    [{i}] ({x:.1f}, {y:.1f})")

    # Cleanup
    router.delete_connector(conn)
    router.delete_shape(shape1)
    router.delete_shape(shape2)

    print("\n  PASSED\n")


def multi_connector_routing():
    """Multiple connectors sharing the same routing space."""
    print("=" * 60)
    print("Test 2: Multi-Connector Routing with Shared Obstacles")
    print("=" * 60)

    router = avoid.Router(avoid.RouterFlag.OrthogonalRouting)
    router.set_routing_parameter(avoid.RoutingParameter.segmentPenalty, 10)
    router.set_routing_parameter(avoid.RoutingParameter.shapeBufferDistance, 4.0)

    # Create 3 obstacles in a row
    obs1 = router.add_rectangle(200, 100, 60, 80, id=1)
    obs2 = router.add_rectangle(350, 200, 60, 80, id=2)
    obs3 = router.add_rectangle(500, 100, 60, 80, id=3)

    print("  Added 3 obstacles")

    # Create connectors that must navigate around them
    conns = []
    endpoints = [
        (50, 140, 650, 140),   # horizontal above obs1/obs3
        (50, 240, 650, 240),   # horizontal through middle
        (230, 20, 230, 320),   # vertical through left side
        (530, 20, 530, 320),   # vertical through right side
    ]

    for i, (x1, y1, x2, y2) in enumerate(endpoints):
        c = avoid.ConnRef(router, x1, y1, x2, y2, id=i + 1)
        conns.append(c)

    print(f"  Created {len(conns)} connectors")

    router.process_transaction()

    print("\n  Routes:")
    for i, c in enumerate(conns):
        route = c.display_route()
        print(f"    Conn {i+1}: {len(route)} segments")
        for j, (x, y) in enumerate(route):
            print(f"      [{j}] ({x:.1f}, {y:.1f})")

    # Cleanup
    for c in conns:
        router.delete_connector(c)
    router.delete_shape(obs1)
    router.delete_shape(obs2)
    router.delete_shape(obs3)

    print("\n  PASSED\n")


def dynamic_move_test():
    """Test moving a shape and re-routing affected connectors."""
    print("=" * 60)
    print("Test 3: Dynamic Shape Movement & Re-routing")
    print("=" * 60)

    router = avoid.Router(avoid.RouterFlag.OrthogonalRouting)
    router.set_routing_parameter(avoid.RoutingParameter.segmentPenalty, 10)
    router.set_routing_parameter(avoid.RoutingParameter.shapeBufferDistance, 4.0)

    # Add one movable obstacle
    obs = router.add_rectangle(250, 180, 80, 60, id=1)
    print("  Added obstacle at (250, 180)")

    # Connector going from left to right
    conn = avoid.ConnRef(router, src_x=50, src_y=210, dst_x=550, dst_y=210, id=1)

    router.process_transaction()

    route_before = conn.display_route()
    print(f"\n  Initial route: {len(route_before)} points")
    for i, (x, y) in enumerate(route_before):
        print(f"    [{i}] ({x:.1f}, {y:.1f})")

    # Move the obstacle down to block the original path more directly
    router.move_shape(obs, 0, 80)  # move down by 80 units
    print("\n  Moved obstacle down by 80 units...")
    router.process_transaction()

    route_after = conn.display_route()
    print(f"  Updated route: {len(route_after)} points")
    for i, (x, y) in enumerate(route_after):
        print(f"    [{i}] ({x:.1f}, {y:.1f})")

    router.delete_connector(conn)
    router.delete_shape(obs)

    print("\n  PASSED\n")


def polygon_shape_test():
    """Test using arbitrary polygon (non-rectangular) shapes."""
    print("=" * 60)
    print("Test 4: Polygon (L-shaped) Obstacle")
    print("=" * 60)

    router = avoid.Router(avoid.RouterFlag.OrthogonalRouting)
    router.set_routing_parameter(avoid.RoutingParameter.segmentPenalty, 10)
    router.set_routing_parameter(avoid.RoutingParameter.shapeBufferDistance, 4.0)

    # L-shaped polygon (6 points)
    poly = avoid.Polygon(6)
    poly.set_point(0, avoid.Point(200, 100))
    poly.set_point(1, avoid.Point(280, 100))
    poly.set_point(2, avoid.Point(280, 200))
    poly.set_point(3, avoid.Point(360, 200))
    poly.set_point(4, avoid.Point(360, 260))
    poly.set_point(5, avoid.Point(200, 260))

    shape = avoid.ShapeRef(router, poly, id=1)
    print("  Added L-shaped polygon obstacle")

    # Route connector that must go around the L-shape
    conn = avoid.ConnRef(router, src_x=100, src_y=180, dst_x=450, dst_y=180, id=1)

    router.process_transaction()

    route = conn.display_route()
    print(f"\n  Route around L-shape: {len(route)} points")
    for i, (x, y) in enumerate(route):
        print(f"    [{i}] ({x:.1f}, {y:.1f})")

    router.delete_connector(conn)
    router.delete_shape(shape)

    print("\n  PASSED\n")


def utility_functions():
    """Test distance utility functions."""
    print("=" * 60)
    print("Test 5: Utility Functions (Distance Calculations)")
    print("=" * 60)

    p1 = avoid.Point(0, 0)
    p2 = avoid.Point(3, 4)
    p3 = avoid.Point(10, 0)

    euc = avoid.euclidean_dist(p1, p2)
    man = avoid.manhattan_dist(p1, p2)
    man2 = avoid.manhattan_dist(p1, p3)

    print(f"  euclidean_dist((0,0), (3,4)) = {euc:.2f}  (expected: 5.00)")
    print(f"  manhattan_dist((0,0), (3,4))  = {man:.2f}  (expected: 7.00)")
    print(f"  manhattan_dist((0,0), (10,0)) = {man2:.2f} (expected: 10.00)")

    assert abs(euc - 5.0) < 0.01, "euclidean_dist failed"
    assert abs(man - 7.0) < 0.01, "manhattan_dist failed"
    assert abs(man2 - 10.0) < 0.01, "manhattan_dist failed"

    print("\n  PASSED\n")


if __name__ == "__main__":
    print("\n" + "#" * 60)
    print("#  pylibavoid Test Suite")
    print("#  libavoid Python bindings via pybind11")
    print("#" * 60 + "\n")

    try:
        utility_functions()
        basic_orthogonal_routing()
        multi_connector_routing()
        dynamic_move_test()
        polygon_shape_test()

        print("#" * 60)
        print("#  ALL TESTS PASSED")
        print("#" * 60)
    except Exception as e:
        print(f"\n  ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
