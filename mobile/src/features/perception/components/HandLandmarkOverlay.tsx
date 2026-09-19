import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { HandLandmarksEvent } from '../types';
import { transformLandmarkToView, TransformationParams } from '../utils/landmarkTransformer';

interface HandLandmarkOverlayProps {
  perceptionData: HandLandmarksEvent | null;
  width: number;
  height: number;
}

// MediaPipe 21 Hand Landmark Anatomical Connections (Bones)
const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index Finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle Finger
  [9, 10], [10, 11], [11, 12],
  // Ring Finger
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm / Knuckle Bridge
  [5, 9], [9, 13], [13, 17]
];

/**
 * Gate C.1: HandLandmarkOverlay with rigid single-pass coordinate transformation.
 *
 * Uses transformLandmarkToView to map MediaPipe normalized coordinates
 * to the display viewport, correctly accounting for sensor rotation (270°),
 * aspect-fill crop/scale, and front-camera mirroring.
 *
 * ZERO rendering when perceptionData is null or hands.length === 0.
 * NO synthetic fallback coordinates or default skeletons.
 */
export const HandLandmarkOverlay: React.FC<HandLandmarkOverlayProps> = ({
  perceptionData,
  width: viewWidth,
  height: viewHeight,
}) => {
  if (!perceptionData || !perceptionData.hands || perceptionData.hands.length === 0) {
    return null;
  }

  const transformParams: TransformationParams = {
    imageWidth: perceptionData.imageWidth || 960,
    imageHeight: perceptionData.imageHeight || 720,
    rotationDegrees: perceptionData.rotationDegrees ?? 270,
    viewWidth,
    viewHeight,
    isFrontCamera: true,
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
        {perceptionData.hands.map((hand, handIndex) => {
          const isLeft = hand.handedness === 'Left';
          const boneColor = isLeft ? '#00E5FF' : '#FF4081'; // Teal for Left, Pink for Right
          const nodeColor = isLeft ? '#00B0FF' : '#E91E63';

          const transformedLandmarks = hand.landmarks.map((lm) =>
            transformLandmarkToView(lm, transformParams)
          );

          return (
            <React.Fragment key={`hand-${handIndex}-${hand.handedness}`}>
              {/* Bone Connections */}
              {HAND_CONNECTIONS.map(([startIndex, endIndex], lineIndex) => {
                const p1 = transformedLandmarks[startIndex];
                const p2 = transformedLandmarks[endIndex];
                if (!p1 || !p2) return null;

                return (
                  <Line
                    key={`line-${handIndex}-${lineIndex}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={boneColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity={0.9}
                  />
                );
              })}

              {/* Landmark Nodes */}
              {transformedLandmarks.map((point, nodeIndex) => {
                const isFingertip = [4, 8, 12, 16, 20].includes(nodeIndex);
                const radius = isFingertip ? 6 : 4;

                return (
                  <Circle
                    key={`node-${handIndex}-${nodeIndex}`}
                    cx={point.x}
                    cy={point.y}
                    r={radius}
                    fill={isFingertip ? '#FFFFFF' : nodeColor}
                    stroke={boneColor}
                    strokeWidth="1.5"
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};
