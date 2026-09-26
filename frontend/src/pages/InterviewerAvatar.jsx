import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import interviewerModel from "../assets/avatars/interviewer.glb";

function InterviewerAvatar({ speaking = false }) {
  const { scene } = useGLTF(interviewerModel);

  const avatarGroup = useRef(null);

  // =========================
  // BLINKING
  // =========================
  const blinkValue = useRef(0);
  const blinkDirection = useRef(0);
  const nextBlink = useRef(2);

  // =========================
  // FACE / MOUTH
  // =========================
  const faceMeshes = useRef([]);
  const mouthMeshes = useRef([]);

  // =========================
  // BONES
  // =========================
  const headBone = useRef(null);

  const leftArm = useRef(null);
  const rightArm = useRef(null);

const leftForeArm = useRef(null);
const rightForeArm = useRef(null);
  // =========================
  // ORIGINAL HEAD ROTATION
  // =========================
  const headBaseRotation = useRef({
    x: 0,
    y: 0,
    z: 0,
  });

  // =========================
  // FIND BONES
  // =========================
  useEffect(() => {
    const faces = [];
    const mouths = [];

    scene.traverse((child) => {
      // =====================
      // FACE
      // =====================
      if (
        child.isMesh &&
        child.morphTargetDictionary
      ) {
        const dictionary =
          child.morphTargetDictionary;

        if (
          dictionary.eyeBlinkLeft !== undefined ||
          dictionary.eyeBlinkRight !== undefined
        ) {
          faces.push(child);
        }

        if (dictionary.jawOpen !== undefined) {
          mouths.push(child);
        }
      }

      // =====================
      // BONES
      // =====================
      if (child.isBone) {
        if (child.name === "Head") {
          headBone.current = child;

          headBaseRotation.current = {
            x: child.rotation.x,
            y: child.rotation.y,
            z: child.rotation.z,
          };
        }

        if (child.name === "LeftArm") {
          leftArm.current = child;
        }

        if (child.name === "RightArm") {
          rightArm.current = child;
        }

       if (child.name === "LeftForeArm") {
  leftForeArm.current = child;
}

if (child.name === "RightForeArm") {
  rightForeArm.current = child;
}
      }
    });

    faceMeshes.current = faces;
    mouthMeshes.current = mouths;

    scene.updateMatrixWorld(true);

    // ==================================================
    // HELPER - POINT ARM IN A DIRECTION
    // ==================================================
    function aimBoneAt(
      bone,
      childBone,
      targetDirection
    ) {
      if (!bone || !childBone) return;

      scene.updateMatrixWorld(true);

      const bonePosition =
        new THREE.Vector3();

      const childPosition =
        new THREE.Vector3();

      bone.getWorldPosition(
        bonePosition
      );

      childBone.getWorldPosition(
        childPosition
      );

      // Current shoulder -> elbow direction
      const currentDirection =
        childPosition
          .clone()
          .sub(bonePosition)
          .normalize();

      // Direction we want
      const target =
        targetDirection
          .clone()
          .normalize();

      const deltaQuaternion =
        new THREE.Quaternion()
          .setFromUnitVectors(
            currentDirection,
            target
          );

      const currentWorldQuaternion =
        new THREE.Quaternion();

      bone.getWorldQuaternion(
        currentWorldQuaternion
      );

      const desiredWorldQuaternion =
        deltaQuaternion
          .clone()
          .multiply(
            currentWorldQuaternion
          );

      const parentWorldQuaternion =
        new THREE.Quaternion();

      bone.parent.getWorldQuaternion(
        parentWorldQuaternion
      );

      const localQuaternion =
        parentWorldQuaternion
          .clone()
          .invert()
          .multiply(
            desiredWorldQuaternion
          );

      bone.quaternion.copy(
        localQuaternion
      );

      scene.updateMatrixWorld(true);
    }

    // ==================================================
    // NATURAL INTERVIEWER ARM POSITION
    // ==================================================

  // LEFT ARM - down with a small gap from body
aimBoneAt(
  leftArm.current,
  leftForeArm.current,
  new THREE.Vector3(-0.22, -1, 0)
);

// RIGHT ARM - down with a small gap from body
aimBoneAt(
  rightArm.current,
  rightForeArm.current,
  new THREE.Vector3(0.22, -1, 0)
);

// Slightly rotate forearms away from the body
if (leftForeArm.current) {
  leftForeArm.current.rotation.z -= 0.12;
}

if (rightForeArm.current) {
  rightForeArm.current.rotation.z += 0.12;
}

scene.updateMatrixWorld(true);

  }, [scene]);

  // =========================
  // ANIMATION
  // =========================
  useFrame((state, delta) => {

    // =========================
    // BLINKING
    // =========================
    nextBlink.current -= delta;

    if (
      nextBlink.current <= 0 &&
      blinkDirection.current === 0
    ) {
      blinkDirection.current = 1;
    }

    if (
      blinkDirection.current === 1
    ) {
      blinkValue.current +=
        delta * 10;

      if (
        blinkValue.current >= 1
      ) {
        blinkValue.current = 1;
        blinkDirection.current = -1;
      }
    }

    if (
      blinkDirection.current === -1
    ) {
      blinkValue.current -=
        delta * 10;

      if (
        blinkValue.current <= 0
      ) {
        blinkValue.current = 0;
        blinkDirection.current = 0;

        nextBlink.current =
          2 + Math.random() * 3;
      }
    }

    // =========================
    // APPLY BLINK
    // =========================
    faceMeshes.current.forEach(
      (mesh) => {
        const dictionary =
          mesh.morphTargetDictionary;

        const influences =
          mesh.morphTargetInfluences;

        const leftIndex =
          dictionary.eyeBlinkLeft;

        const rightIndex =
          dictionary.eyeBlinkRight;

        if (
          leftIndex !== undefined
        ) {
          influences[leftIndex] =
            blinkValue.current;
        }

        if (
          rightIndex !== undefined
        ) {
          influences[rightIndex] =
            blinkValue.current;
        }
      }
    );

    const time =
      state.clock.getElapsedTime();

    // =========================
    // HEAD MOVEMENT
    // =========================
    if (headBone.current) {
      headBone.current.rotation.x =
        headBaseRotation.current.x -
        0.05 +
        Math.sin(
          time * 0.35
        ) *
          0.005;

      headBone.current.rotation.y =
        headBaseRotation.current.y +
        Math.sin(
          time * 0.5
        ) *
          0.004;

      headBone.current.rotation.z =
        headBaseRotation.current.z;
    }

    // =========================
    // MOUTH MOVEMENT
    // =========================
    mouthMeshes.current.forEach(
      (mesh) => {
        const jawIndex =
          mesh.morphTargetDictionary
            .jawOpen;

        if (
          jawIndex === undefined
        ) {
          return;
        }

        if (speaking) {
          const mouthValue =
            (
              Math.sin(
                time * 8
              ) + 1
            ) / 2;

          mesh.morphTargetInfluences[
            jawIndex
          ] =
            mouthValue * 0.35;
        } else {
          mesh.morphTargetInfluences[
            jawIndex
          ] = 0;
        }
      }
    );
  });

  // =========================
  // AVATAR
  // =========================
  return (
    <group
      ref={avatarGroup}
      position={[0, -1.18, 0]}
    >
      <primitive
        object={scene}
        scale={1.18}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

export default InterviewerAvatar;