import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import avatarUrl from "../assets/avatars/portrait_lipsync.glb";

function GLBAvatarTest({
  speaking = false,
  speechBoundary = 0,
  height = "100%",
}) {
  const mountRef = useRef(null);

  const mixerRef = useRef(null);
  const lipSyncActionRef = useRef(null);

  const speakingRef = useRef(speaking);
  const speechBoundaryRef =
    useRef(speechBoundary);

  // ------------------------------------------
  // MOUTH / MORPH TARGET REFERENCES
  // ------------------------------------------

  const mouthTargetsRef = useRef([]);

  // ------------------------------------------
  // CURRENT MOUTH ANIMATION STATE
  // ------------------------------------------

  const mouthAnimationRef = useRef({
    active: false,
    progress: 0,
    duration: 180,
    openAmount: 0,
    roundAmount: 0,
  });

  // ------------------------------------------
  // SPEAKING STATE
  // ------------------------------------------

  useEffect(() => {
    speakingRef.current = speaking;

    const action =
      lipSyncActionRef.current;

    if (speaking) {
      console.log(
        "🔊 Maya speaking"
      );

      // Start fallback GLB animation
      if (action) {
        action.reset();
        action.enabled = true;
        action.setLoop(
          THREE.LoopRepeat,
          Infinity
        );
        action.setEffectiveWeight(1);
        action.setEffectiveTimeScale(1);
        action.play();
      }
    } else {
      console.log(
        "🔇 Maya stopped speaking"
      );

      if (action) {
        action.stop();
        action.reset();
      }

      // Close mouth
      mouthTargetsRef.current.forEach(
        (target) => {
          if (
            target.mesh.morphTargetDictionary &&
            target.mesh.morphTargetInfluences
          ) {
            const openIndex =
              target.mesh
                .morphTargetDictionary
                .MouthOpen;

            const roundIndex =
              target.mesh
                .morphTargetDictionary
                .MouthRound;

            if (
              openIndex !== undefined
            ) {
              target.mesh.morphTargetInfluences[
                openIndex
              ] = 0;
            }

            if (
              roundIndex !== undefined
            ) {
              target.mesh.morphTargetInfluences[
                roundIndex
              ] = 0;
            }
          }
        }
      );

      mouthAnimationRef.current.active =
        false;
    }
  }, [speaking]);

  // ------------------------------------------
  // SPEECH BOUNDARY
  // ------------------------------------------

  useEffect(() => {
    speechBoundaryRef.current =
      speechBoundary;

    if (!speakingRef.current) {
      return;
    }

    console.log(
      "🗣️ New speech boundary:",
      speechBoundary
    );

    /*
     * Every time SpeechSynthesis reaches
     * another part of the sentence, start
     * a new mouth movement.
     */

    const pattern =
      speechBoundary % 4;

    let openAmount = 0.55;
    let roundAmount = 0.15;

    if (pattern === 0) {
      openAmount = 0.65;
      roundAmount = 0.1;
    }

    if (pattern === 1) {
      openAmount = 0.35;
      roundAmount = 0.35;
    }

    if (pattern === 2) {
      openAmount = 0.75;
      roundAmount = 0.05;
    }

    if (pattern === 3) {
      openAmount = 0.45;
      roundAmount = 0.5;
    }

    mouthAnimationRef.current = {
      active: true,
      progress: 0,
      duration: 130 + Math.random() * 100,
      openAmount,
      roundAmount,
    };
  }, [speechBoundary]);

  // ------------------------------------------
  // THREE.JS
  // ------------------------------------------

  useEffect(() => {
    const container =
      mountRef.current;

    if (!container) return;

    // ========================================
    // SCENE
    // ========================================

    const scene =
      new THREE.Scene();

    scene.background =
      new THREE.Color(
        0xf2f7fb
      );

    // ========================================
    // CAMERA
    // ========================================

    const camera =
      new THREE.PerspectiveCamera(
        35,
        container.clientWidth /
          container.clientHeight,
        0.1,
        100
      );

    // ========================================
    // RENDERER
    // ========================================

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(
      renderer.domElement
    );

    // ========================================
    // LIGHTING
    // ========================================

    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        2.5
      );

    scene.add(
      ambientLight
    );

    const keyLight =
      new THREE.DirectionalLight(
        0xffffff,
        2
      );

    keyLight.position.set(
      2,
      3,
      5
    );

    scene.add(
      keyLight
    );

    // ========================================
    // LOAD GLB
    // ========================================

    const loader =
      new GLTFLoader();

    loader.load(
      avatarUrl,

      (gltf) => {
        console.log(
          "✅ GLB loaded"
        );

        console.log(
          "🎬 Animations:",
          gltf.animations
        );

        const avatar =
          gltf.scene;

        scene.add(
          avatar
        );

        // ====================================
        // RESET TRANSFORM
        // ====================================

        avatar.position.set(
          0,
          0,
          0
        );

        avatar.rotation.set(
          0,
          0,
          0
        );

        avatar.scale.set(
          1,
          1,
          1
        );

        // ====================================
        // FIND ORIGINAL BOUNDS
        // ====================================

        avatar.updateMatrixWorld(
          true
        );

        const box =
          new THREE.Box3().setFromObject(
            avatar
          );

        const size =
          new THREE.Vector3();

        const center =
          new THREE.Vector3();

        box.getSize(
          size
        );

        box.getCenter(
          center
        );

        console.log(
          "📦 Avatar bounds:",
          {
            width: size.x,
            height: size.y,
            depth: size.z,
          }
        );

        // ====================================
        // CENTRE AVATAR
        // ====================================

        avatar.position.x -=
          center.x;

        avatar.position.y -=
          center.y;

        avatar.position.z -=
          center.z;

        avatar.updateMatrixWorld(
          true
        );

        // ====================================
        // FINAL BOUNDS
        // ====================================

        const finalBox =
          new THREE.Box3().setFromObject(
            avatar
          );

        const finalSize =
          new THREE.Vector3();

        const finalCenter =
          new THREE.Vector3();

        finalBox.getSize(
          finalSize
        );

        finalBox.getCenter(
          finalCenter
        );

        console.log(
          "📐 Final avatar:",
          finalSize
        );

        // ====================================
        // CAMERA FIT
        // ====================================

        const aspect =
          container.clientWidth /
          container.clientHeight;

        const verticalFov =
          THREE.MathUtils.degToRad(
            camera.fov
          );

        const horizontalFov =
          2 *
          Math.atan(
            Math.tan(
              verticalFov / 2
            ) * aspect
          );

        const distanceForHeight =
          (finalSize.y / 2) /
          Math.tan(
            verticalFov / 2
          );

        const distanceForWidth =
          (finalSize.x / 2) /
          Math.tan(
            horizontalFov / 2
          );

        /*
         * 0.82 is the tighter framing
         * we already selected.
         *
         * Do not change this now.
         */

        const cameraDistance =
          Math.max(
            distanceForHeight,
            distanceForWidth
          ) * 0.82;

        camera.position.set(
          finalCenter.x,
          finalCenter.y,
          cameraDistance
        );

        camera.lookAt(
          finalCenter.x,
          finalCenter.y,
          finalCenter.z
        );

        // ====================================
        // FIND MOUTH MORPH TARGETS
        // ====================================

        avatar.traverse(
          (object) => {
            if (
              !object.isMesh ||
              !object.morphTargetDictionary ||
              !object.morphTargetInfluences
            ) {
              return;
            }

            const dictionary =
              object.morphTargetDictionary;

            console.log(
              "🎭 Morph targets:",
              Object.keys(dictionary)
            );

            if (
              dictionary.MouthOpen !==
                undefined ||
              dictionary.MouthRound !==
                undefined
            ) {
              mouthTargetsRef.current.push(
                {
                  mesh: object,
                }
              );

              console.log(
                "👄 Mouth morph targets found"
              );
            }
          }
        );

        // ====================================
        // ANIMATION MIXER
        // ====================================

        if (
          gltf.animations.length > 0
        ) {
          const mixer =
            new THREE.AnimationMixer(
              avatar
            );

          mixerRef.current =
            mixer;

          gltf.animations.forEach(
            (clip) => {
              console.log(
                `🎬 Animation found: "${clip.name}"`
              );
            }
          );

          const lipSyncClip =
            gltf.animations.find(
              (clip) =>
                clip.name
                  .toLowerCase()
                  .trim() ===
                "lipsync"
            );

          if (lipSyncClip) {
            console.log(
              "👄 LipSync animation found"
            );

            const action =
              mixer.clipAction(
                lipSyncClip
              );

            action.reset();

            action.enabled =
              true;

            action.setLoop(
              THREE.LoopRepeat,
              Infinity
            );

            action.setEffectiveWeight(
              1
            );

            action.setEffectiveTimeScale(
              1
            );

            action.stop();

            lipSyncActionRef.current =
              action;

            console.log(
              "⏸️ LipSync ready"
            );

            /*
             * We keep the GLB animation
             * available as a fallback.
             */

            if (
              speakingRef.current
            ) {
              action.reset();
              action.play();
            }
          }
        }
      },

      undefined,

      (error) => {
        console.error(
          "❌ Failed to load GLB:",
          error
        );
      }
    );

    // ========================================
    // ANIMATION LOOP
    // ========================================

    const clock =
      new THREE.Clock();

    let animationFrame;

    const animate = () => {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      const delta =
        clock.getDelta();

      // --------------------------------------
      // THREE.JS ANIMATION MIXER
      // --------------------------------------

      if (
        mixerRef.current
      ) {
        mixerRef.current.update(
          delta
        );
      }

      // --------------------------------------
      // MOUTH MORPH ANIMATION
      // --------------------------------------

      const mouth =
        mouthAnimationRef.current;

      if (
        speakingRef.current &&
        mouthTargetsRef.current.length > 0
      ) {
        mouth.progress +=
          delta * 1000;

        const progress =
          mouth.progress /
          mouth.duration;

        /*
         * Create a natural open-close
         * movement instead of a static mouth.
         */

        const wave =
          Math.sin(
            progress * Math.PI
          );

        const openValue =
          mouth.openAmount *
          wave;

        const roundValue =
          mouth.roundAmount *
          wave;

        mouthTargetsRef.current.forEach(
          (target) => {
            const mesh =
              target.mesh;

            const dictionary =
              mesh.morphTargetDictionary;

            const influences =
              mesh.morphTargetInfluences;

            const openIndex =
              dictionary.MouthOpen;

            const roundIndex =
              dictionary.MouthRound;

            if (
              openIndex !== undefined
            ) {
              influences[
                openIndex
              ] = THREE.MathUtils.lerp(
                influences[
                  openIndex
                ],
                openValue,
                0.45
              );
            }

            if (
              roundIndex !== undefined
            ) {
              influences[
                roundIndex
              ] = THREE.MathUtils.lerp(
                influences[
                  roundIndex
                ],
                roundValue,
                0.45
              );
            }
          }
        );

        // Start another natural mouth
        // movement when this one finishes.
        if (
          progress >= 1
        ) {
          mouth.progress = 0;

          /*
           * Keep slight variation while
           * Maya is continuously speaking.
           */
          mouth.duration =
            100 +
            Math.random() * 130;

          mouth.openAmount =
            0.35 +
            Math.random() * 0.4;

          mouth.roundAmount =
            Math.random() * 0.35;
        }
      } else {
        // Smoothly close mouth
        mouthTargetsRef.current.forEach(
          (target) => {
            const mesh =
              target.mesh;

            const dictionary =
              mesh.morphTargetDictionary;

            const influences =
              mesh.morphTargetInfluences;

            const openIndex =
              dictionary.MouthOpen;

            const roundIndex =
              dictionary.MouthRound;

            if (
              openIndex !== undefined
            ) {
              influences[
                openIndex
              ] = THREE.MathUtils.lerp(
                influences[
                  openIndex
                ],
                0,
                0.2
              );
            }

            if (
              roundIndex !== undefined
            ) {
              influences[
                roundIndex
              ] = THREE.MathUtils.lerp(
                influences[
                  roundIndex
                ],
                0,
                0.2
              );
            }
          }
        );
      }

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    // ========================================
    // RESIZE
    // ========================================

    const handleResize = () => {
      if (!container) return;

      const width =
        container.clientWidth;

      const heightValue =
        container.clientHeight;

      camera.aspect =
        width /
        heightValue;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        heightValue
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    // ========================================
    // CLEANUP
    // ========================================

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      if (
        lipSyncActionRef.current
      ) {
        lipSyncActionRef.current.stop();
      }

      if (
        mixerRef.current
      ) {
        mixerRef.current.stopAllAction();
      }

      renderer.dispose();

      if (
        container &&
        renderer.domElement &&
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }

      mixerRef.current = null;
      lipSyncActionRef.current =
        null;

      mouthTargetsRef.current =
        [];
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height,
        overflow: "hidden",
      }}
    />
  );
}

export default GLBAvatarTest;