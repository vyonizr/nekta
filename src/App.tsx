import { createSignal, createMemo } from 'solid-js'
import type { Component } from 'solid-js'
import ordinal from 'ordinal'

import styles from './App.module.css'

/**
 * If the display is X, press the button in the Y position.
 * If the display is X, press the button labeled "Y".
 * If the display is X, press the button in the same position as you pressed in stage Y.
 * If the display is X, press the button with the same label you pressed in stage Y.
 */

import { IRulesPayload, IAnswer } from './types'
import {
  displayPlusOne,
  randomIntFromInterval,
  findValidator,
  hintTextGenerator,
  createRandomSequence,
} from './utils'
import { RULE_MODES } from './constants'
// import { generateDummyRules } from './dummy'

const App: Component = () => {
  const [currentDisplayedNumber, setCurrentDisplayedNumber] =
    createSignal<number>(randomIntFromInterval())
  const [stage, setStage] = createSignal(0)
  const [answers, setAnswers] = createSignal<IAnswer[]>([])

  const stageDisplay = createMemo(() => stage() + 1)

  const [sequence, setSequence] = createSignal<number[]>(createRandomSequence())

  function generateRules() {
    const rules: IRulesPayload[][] = []

    for (let i = 0; i < 5; i++) {
      const stageRule: IRulesPayload[] = []

      for (let j = 0; j < 4; j++) {
        const includePreviousStage = rules.length >= 1
        const maxIndex = includePreviousStage ? 3 : 1
        const ruleModeIndex = randomIntFromInterval(0, maxIndex)
        const usedMode = RULE_MODES[ruleModeIndex]
        const yVal =
          ruleModeIndex > 1
            ? randomIntFromInterval(0, rules.length - 1)
            : ruleModeIndex === 1
            ? randomIntFromInterval(0, 3)
            : randomIntFromInterval(1, 4)

        stageRule.push({
          text: `If the display is ${displayPlusOne(
            j
          )}, press the button ${hintTextGenerator(usedMode, yVal)}`,
          validator: findValidator(usedMode),
          mode: usedMode,
          yVal,
        })
      }

      rules.push(stageRule)
    }

    return rules
  }

  const [rules] = createSignal<IRulesPayload[][]>(generateRules())

  function onClickLabel(answer: IAnswer) {
    const selectedHint = rules()[stage()][answer.index]
    const correctAnswer = generateCorrectAnswer()
    const isCorrect = selectedHint.validator(correctAnswer, answer)

    if (isCorrect) {
      setAnswers((current) => [...current, answer])
      setStage((current) => current + 1)
    } else {
      if (stage() > 0) {
        setStage(0)
        setAnswers([])
      }
    }

    setSequence(createRandomSequence())
    setCurrentDisplayedNumber(randomIntFromInterval(1, 4))
  }

  function generateCorrectAnswer(): IAnswer {
    const instruction = rules()[stage()][currentDisplayedNumber() - 1]

    switch (instruction.mode) {
      case 'label-stage-y':
      case 'position-stage-y':
        const referredAnswer = answers()[instruction.yVal]
        return {
          label: referredAnswer.label,
          index: referredAnswer.index,
        }
      case 'position-y':
        const label = sequence()[instruction.yVal]
        return {
          label,
          index: instruction.yVal,
        }
      case 'label-y':
      default:
        const index = sequence().findIndex(
          (label) => label === instruction.yVal
        )
        return {
          label: instruction.yVal,
          index,
        }
    }
  }

  return (
    <div class={styles.App}>
      <h1>Stage: {stageDisplay()}</h1>
      <h2>{currentDisplayedNumber}</h2>
      {sequence().map((label, index) => (
        <button onclick={() => onClickLabel({ label, index })}>{label}</button>
      ))}
      <h1>Instructions</h1>
      {/* <ol>
        {rules()[stage()].map((rule) => (
          <li>{rule.text}</li>
        ))}
      </ol> */}
      {rules().map((stageRule, index) => (
        <div>
          <h2>Stage {displayPlusOne(index)}</h2>
          <ol>
            {stageRule.map((rule) => (
              <li>{rule.text}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}

export default App
