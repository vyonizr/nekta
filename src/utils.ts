import ordinal from 'ordinal'

import { TRuleMode, TValidatorFn, IAnswer } from './types'

export function displayPlusOne(number: number) {
  return number + 1
}

export function randomIntFromInterval(min = 1, max = 4) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function hintPressInXPosition(targetIndex: number) {
  return `in the ${ordinal(displayPlusOne(targetIndex))} position`
}

export function hintPressLabel(targetNumber: number) {
  return `labeled "${targetNumber}"`
}

export function hintSamePosInStage(targetStage: number) {
  return `in the same position as you pressed in stage ${displayPlusOne(
    targetStage
  )}`
}

export function hintSameLabelInStage(targetStage: number) {
  return `with the same label you pressed in stage ${displayPlusOne(
    targetStage
  )}`
}

export function findValidator(mode: TRuleMode): TValidatorFn {
  switch (mode) {
    case 'label-y':
    case 'label-stage-y':
      return yLabelValidator
    case 'position-stage-y':
    case 'position-y':
    default:
      return yPositionValidator
  }
}

export function yPositionValidator(
  correctAnswer: IAnswer,
  selectedAnswer: IAnswer
) {
  return selectedAnswer.index === correctAnswer.index
}

export function yLabelValidator(
  correctAnswer: IAnswer,
  selectedAnswer: IAnswer
) {
  return selectedAnswer.label === correctAnswer.label
}

export function hintTextGenerator(mode: TRuleMode, targetNumber: number) {
  switch (mode) {
    case 'label-stage-y':
      return hintSameLabelInStage(targetNumber)
    case 'position-stage-y':
      return hintSamePosInStage(targetNumber)
    case 'label-y':
      return hintPressLabel(targetNumber)
    case 'position-y':
    default:
      return hintPressInXPosition(targetNumber)
  }
}

export function createRandomSequence() {
  const sequence: number[] = []

  while (sequence.length < 4) {
    const label = randomIntFromInterval(1, 4)
    if (!sequence.includes(label)) {
      sequence.push(label)
    }
  }

  return sequence
}
