# avatar.glb — 3D character export guide

The hero section runs a **real-time Three.js scene** (`js/hero3d.js`). It tries to load
**`assets/models/avatar.glb`** on every page load:

- **Model present** → your stylized 3D likeness renders with cursor head/eye tracking, the
  cursor-following purple light, idle breathing/float, and scroll transitions.
- **Model missing** (current state) → a procedural stylized placeholder bust renders with the
  exact same interactions, so the scene is never empty and nothing else needs to change.

**To ship your real avatar: drop your exported file at `assets/models/avatar.glb`, commit, push. That's it.**

## Your Blender / KeenTools FaceBuilder pipeline

1. Install Blender (4.x) and the KeenTools FaceBuilder add-on.
2. FaceBuilder → New Head → add your photo(s) (front + 3/4 angle work best).
3. Align pins to the facial landmarks in each photo, then refine the mesh.
4. Generate the face texture (Create Texture, 2048×2048 is plenty).
5. Model the stylized body, curly hair, and navy shirt around the head
   (keep the Pixar-adjacent proportions of the current hero image).
6. Separate the eyes from the head so they can track the cursor.
7. (Optional) Rig with an armature; a simple idle animation clip will auto-play.
8. Export as glTF Binary (.glb).

## Export requirements (so the site picks everything up automatically)

| Requirement | Value |
|---|---|
| File path | `assets/models/avatar.glb` |
| Node names | Head mesh/bone named **`Head`**; eyes **`Eye_L`** and **`Eye_R`** (an upper-chest bone named `Chest`/`Spine2` enables breathing) |
| Orientation | Facing **+Z**, Y-up (Blender's glTF exporter default `+Y up` is correct) |
| Scale | Real-world metres (~1.7–1.9 m tall figure). The loader auto-normalizes height, but sane scale avoids surprises |
| Origin | Feet/bottom at world origin preferred (loader also auto-grounds) |
| Polygons | ≤ 60k triangles total (hair included) |
| Textures | ≤ 2048×2048, JPEG/PNG embedded in the .glb |
| Materials | Principled BSDF only (exports as PBR MetallicRoughness) |
| Animation | Optional; if present, the **first clip** auto-plays as idle |

The loader matches node names case-insensitively (`head`, `LeftEye`, `eye.L`, etc. also work),
but the names above are the guaranteed path.

## Optional: compress before committing

```bash
npx @gltf-transform/cli optimize avatar.glb avatar.glb --compress draco --texture-compress webp
```

Draco decoding is already wired up in `js/hero3d.js`, so compressed files just work.

## Verifying locally

```bash
python -m http.server 4173
```

Open http://localhost:4173 — check the console for WebGL errors, move the cursor
(head, eyes, and purple light should follow), and scroll (character recedes and hands off
to the About section).
