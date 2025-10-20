# Blender headless conversion: OBJ -> GLB
# Usage:
#   blender -b -P tools/blender_obj_to_glb.py -- input.obj output.glb
# Requires Blender 3.x with glTF exporter (built-in).

import bpy, sys, os

argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []
if len(argv) < 2:
    print("Usage: blender -b -P tools/blender_obj_to_glb.py -- input.obj output.glb")
    sys.exit(1)

in_obj, out_glb = argv[0], argv[1]
if not os.path.exists(in_obj):
    print("Input OBJ not found:", in_obj)
    sys.exit(1)

# Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import OBJ
bpy.ops.import_scene.obj(filepath=in_obj)

# Select all, apply transforms
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        obj.select_set(True)
    else:
        obj.select_set(False)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# Export GLB with defaults (you can tune as needed)
bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB', export_texcoords=True, export_normals=True)

print("Exported GLB:", out_glb)
