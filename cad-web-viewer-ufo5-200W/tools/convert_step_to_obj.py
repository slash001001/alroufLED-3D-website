# FreeCAD CLI conversion: STEP -> OBJ
# Usage:
#   freecadcmd tools/convert_step_to_obj.py <input.step> <output.obj>
# Example:
#   freecadcmd tools/convert_step_to_obj.py assets/ufo5-200W.stp public/models/ufo5-200W.obj
#
# Notes:
# - This script meshes the STEP with moderate quality for web viewing.
# - If your FreeCAD build lacks MeshPart, you can fall back to Mesh.export([part], out_obj).

import sys, os

try:
    import FreeCAD
    import Part
    import Mesh
    import MeshPart
except Exception as e:
    print("Run this with freecadcmd (FreeCAD Python). Error:", e)
    sys.exit(1)

def convert(step_path, out_obj, lin_def=0.2, ang_def=0.3, relative=True):
    doc = FreeCAD.newDocument("ConvDoc")
    shape = Part.Shape()
    shape.read(step_path)
    part = doc.addObject("Part::Feature", "Imported")
    part.Shape = shape
    doc.recompute()

    # Mesh with parameters suitable for real-time viewing
    mesh = MeshPart.meshFromShape(Shape=part.Shape,
                                  LinearDeflection=lin_def,
                                  AngularDeflection=ang_def,
                                  Relative=relative)
    mesh_obj = doc.addObject("Mesh::Feature", "Mesh")
    mesh_obj.Mesh = mesh
    doc.recompute()

    try:
        Mesh.export([mesh_obj], out_obj)
        print("Exported OBJ:", out_obj)
    except Exception as e:
        print("Mesh export failed:", e)
        FreeCAD.closeDocument(doc.Name)
        return 1

    FreeCAD.closeDocument(doc.Name)
    return 0

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: freecadcmd tools/convert_step_to_obj.py <input.step> <output.obj>")
        sys.exit(1)

    step_path = sys.argv[1]
    out_obj = sys.argv[2]
    if not os.path.exists(step_path):
        print("Input STEP not found:", step_path)
        sys.exit(1)
    os.makedirs(os.path.dirname(out_obj), exist_ok=True)
    rc = convert(step_path, out_obj)
    sys.exit(rc)
