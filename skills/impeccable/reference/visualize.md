# Visualize: Direction Comps & Asset Production

Load this from [new-work.md](new-work.md) whenever image generation can resolve
implementation uncertainty. PRODUCT.md, DESIGN.md, and an approved
`frontend-design` contract are preconditions. This file must not reopen the
visual world.

The purpose of a probe is to test composition, narrative, hierarchy, density, focal moment, signature use, and image requirements. It is not a second identity workshop. Keep DESIGN.md's palette, typography direction, material language, component character, imagery stance, and motion grammar fixed.

## Generate three compositional options

Render three distinct high-fidelity implementation comps of the requested
surface with whatever generation capability exists. Base them on real content
and the approved creative contract. The comps test how to realize that
contract; they do not propose competing identities.

- Vary only structural uncertainty the contract leaves open: topology,
  sequence, density, responsive composition, or interaction framing.
- Show enough beyond the opening moment to prove the concept can govern the whole requested surface.
- Do not generate a palette artifact, ask new atmosphere questions, introduce a
  different type voice, or invent a new motif. If the contract cannot be
  implemented as written, return the specific conflict once through
  [creative-handoff.md](creative-handoff.md).

Treat each comp as a direction test, not a screenshot specification. Core UI text, responsive behavior, accessibility, semantics, and interaction states remain implementation responsibilities.

## One approval point

Show the three together: in the harness when it can display images, otherwise
on the decision page (`serve-question.mjs`, one option per comp with the comp as
its hero). Ask which implementation best realizes the approved contract and
what feels unfaithful. Then stop and wait. A structured simulated user counts as
attended and receives the same question.

Do not begin code until the user approves an implementation comp or explicitly
delegates the choice. If they delegate, choose against the creative contract,
task brief, PRODUCT.md, and DESIGN.md. Approval does not modify the creative
direction or DESIGN.md.

After approval, summarize the composition and the parts of the comp that must
not be literalized. Return to new-work.md and build; do not rewrite the creative
contract from the comp.

## Inventory implementation fidelity

Before building, inventory the approved comp's major visible ingredients and choose an implementation medium for each: semantic HTML/CSS/SVG, existing project asset, generated raster, sourced raster, icon library, canvas/WebGL, or accepted omission.

Pay special attention to the dominant composition, signature use, image-native content, second-fold system, and any interaction the still image only implies. If the concept depends on a photograph, architectural scene, product object, portrait, or other raster-native material, do not silently replace it with generic CSS scenery.

Treat the comp as a north star, not something to trace. Do not rasterize core UI text or controls. Do not substitute a different visual driver after approval without asking.

## Produce only the assets the build needs

When clean raster ingredients are required and the harness runs subagents, use the shipped asset producer, `impeccable-asset-producer` (`impeccable_asset_producer` in codex): give it the approved comp, output paths, required dimensions and formats, transparency needs, crop notes, and what must remain semantic code. Otherwise produce the minimum required assets in the current thread with whatever generation exists, the native tool or generate-image.mjs.

Return to [new-work.md](new-work.md) for implementation and the finishing pass.
