#!/usr/bin/env python3
"""Blender automation script: import OBJ, optimise, export GLB.

Usage:
    blender --background --python tools/blender_obj_to_glb.py -- \
        --input public/models/ufo5-200W.obj \
        --output public/models/ufo5-200W.glb \
        --decimate 0.35

The script performs a simple decimation pass and recentres the model for the
viewer coordinate system.
"""

import argparse
import math
import os
import sys

import bpy


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="OBJ to GLB with optimisation")
    parser.add_argument("--input", required=True, help="Source OBJ path")
    parser.add_argument("--output", required=True, help="Destination GLB path")
    parser.add_argument(
        "--decimate",
        type=float,
        default=0.4,
        help="Ratio for mesh decimation (0..1). Lower = more aggressive",
    )
    return parser.parse_args(sys.argv[sys.argv.index("--") + 1 :])


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def import_obj(path: str):
    bpy.ops.import_scene.obj(filepath=path)
    return bpy.context.selected_objects


def decimate(obj, ratio: float):
    modifier = obj.modifiers.new(name="Decimate", type="DECIMATE")
    modifier.ratio = ratio
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def recenter(obj):
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    obj.location = (0.0, 0.0, 0.0)
    obj.rotation_euler = (math.radians(90), 0.0, 0.0)


def export_glb(path: str):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_cameras=False,
        export_yup=True,
        export_draco_mesh_compression_enable=False,
    )


def main():
    args = parse_args()
    clear_scene()
    imported = import_obj(os.path.abspath(args.input))

    for obj in imported:
        if obj.type == "MESH" and args.decimate < 0.99:
            decimate(obj, args.decimate)
        recenter(obj)

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    export_glb(os.path.abspath(args.output))
    print(f"Exported GLB → {args.output}")


if __name__ == "__main__":
    main()
