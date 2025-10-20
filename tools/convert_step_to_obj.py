#!/usr/bin/env python3
"""Convert a STEP file into an OBJ mesh using FreeCAD's Python API.

Usage:
    freecadcmd tools/convert_step_to_obj.py <input.step> <output.obj>

The script tesselates the STEP solid with a fine meshing quality suitable for
real-time rendering. Adjust the deflection parameters if you need higher or
lower fidelity.
"""

import argparse
import os
import sys

try:
    import FreeCAD  # type: ignore
    import ImportGui  # type: ignore
    from FreeCAD import Base  # type: ignore
    import Mesh  # type: ignore
    import MeshPart  # type: ignore
    import Part  # type: ignore
except ImportError as exc:  # pragma: no cover - FreeCAD only
    sys.stderr.write("FreeCAD modules are required to run this script.\n")
    raise


def convert(step_path: str, obj_path: str) -> None:
    doc = FreeCAD.newDocument()
    # Load STEP geometry
    shape = Part.Shape()
    shape.read(step_path)
    part = doc.addObject("Part::Feature", "Imported")
    part.Shape = shape
    doc.recompute()

    # Refine mesh for WebGL: lower deflection = more triangles
    params = {
        "LinearDeflection": 0.15,
        "AngularDeflection": 10,
        "Relative": False,
    }

    mesh = MeshPart.meshFromShape(
        Shape=part.Shape,
        LinearDeflection=params["LinearDeflection"],
        AngularDeflection=params["AngularDeflection"],
        Relative=params["Relative"],
    )
    Mesh.export([mesh], obj_path)
    FreeCAD.closeDocument(doc.Name)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert STEP to OBJ for WebGL")
    parser.add_argument("input", help="Path to the STEP (.stp/.step) file")
    parser.add_argument("output", help="Destination OBJ path")
    args = parser.parse_args()

    src = os.path.abspath(args.input)
    dst = os.path.abspath(args.output)

    if not os.path.exists(src):
        sys.exit(f"Input STEP file not found: {src}")

    os.makedirs(os.path.dirname(dst), exist_ok=True)

    convert(src, dst)
    print(f"Saved OBJ mesh to {dst}")
