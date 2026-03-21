# Runtime Lifecycle

This document defines the expected runtime flow for app boot, scene changes, resize, update, and teardown.

## Application boot flow

1. Create the Pixi application.
2. Create the application context.
3. Create shared services: viewport, event bus, asset registry, animation manager, scene manager.
4. Register custom services supplied by the consumer.
5. Mount the Pixi canvas into the provided host element.
6. Start the ticker if `autoStart` is enabled.
7. Load and mount the initial scene.

## Scene activation flow

For a standard scene change from `A` to `B`:

1. Resolve target scene definition.
2. Create scene instance if it does not exist yet.
3. Run `init(context, payload)` once for first-time setup.
4. Mount the scene root into the stage if not already mounted.
5. Call `deactivate()` on the current active scene.
6. Call `mount()` on the target scene if first mount.
7. Call `activate(payload)` on the target scene.
8. Mark the target scene as active.
9. Trigger a layout and resize pass.

## Overlay flow

Overlays behave like stackable scenes.

- A base scene remains mounted while an overlay is active.
- Only the top-most interactive layer receives input unless configured otherwise.
- The base scene may keep updating or pause depending on overlay policy.
- Closing an overlay must restore the previous active layer predictably.

## Per-frame update flow

Each ticker tick runs in this order:

1. advance animation manager;
2. update active scene;
3. update active overlays if enabled;
4. flush deferred cleanup.

The update loop should remain deterministic and must avoid allocating unnecessary work every frame.

### Declarative scene update guidance

- Declarative scenes may use `updateMode: 'frame'` when the full scene must be regenerated each tick.
- The default scene mode is `reactive`, so signal reads in the scene render function re-run only when those reads change.
- Gameplay-heavy scenes should keep the shell declarative and move hot rendering into a `pixora.island()`.
- Islands keep the declarative scene tree stable while patching their own Pixi objects directly.
- The recommended gameplay split is a stable `GameSceneShell` plus an `InPlay` island for entity collections.

## Resize flow

When the host or viewport size changes:

1. update viewport state;
2. resize the Pixi renderer;
3. notify scene manager;
4. call `resize(viewport)` on the active scene and active overlays;
5. run a layout pass for dirty nodes.

Resize work should be batched and only happen when the computed viewport actually changes.

## Cleanup rules

Every lifecycle boundary must dispose what it owns.

- Components dispose local bindings and input handlers.
- Scenes dispose subscriptions, local services, and child nodes.
- Scene manager disposes cached scenes only when explicitly destroyed or evicted.
- App destroy tears down ticker, stage attachments, services, and Pixi resources.

## Failure handling

The runtime should fail early on configuration mistakes such as:

- missing initial scene;
- duplicate scene keys;
- unresolved required services;
- missing required asset keys at scene activation time.

The runtime should fail gracefully on recoverable operational issues such as:

- asset load failure for optional assets;
- overlay close requests when no overlay is open.
