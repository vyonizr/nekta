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
  const [strikes, setStrikes] = createSignal<number>(0)

  const stageDisplay = createMemo(() => stage() + 1)
  const isFailed = createMemo(() => strikes() === 3)

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
      setStrikes((current) => current + 1)
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
      <h1 class='text-3xl font-bold'>
        Stage: {stageDisplay()}/{rules().length}
      </h1>
      <div class='flex w-56 flex-col'>
        <div class='my-2 w-full h-32 bg-slate-900 flex items-center justify-center relative'>
          <h3 class='text-2xl text-red-600 absolute top-0 right-2'>
            {Array(3 - strikes())
              .fill(1)
              .map(() => (
                <>&#10084;</>
              ))}
          </h3>
          <h2 class='cursor-default text-6xl text-green-500'>
            {isFailed() ? 'N/A' : currentDisplayedNumber}
          </h2>
        </div>
        <div class='w-fit grid grid-cols-4 gap-x-3'>
          {sequence().map((label, index) => (
            <button
              class='w-12 h-12 rounded font-bold text-2xl text-white bg-blue-500 hover:bg-blue-600  border-stone-800'
              onclick={() => onClickLabel({ label, index })}
              disabled={isFailed()}
            >
              {isFailed() ? <>&#128937;</> : label}
            </button>
          ))}
        </div>
        {isFailed() && (
          <button class='mt-2 w-full h-12 bg-gray-300 rounded border-stone-800'>
            Try Again
          </button>
        )}
      </div>
      {!isFailed() && (
        <>
          <h1 class='text-3xl font-bold'>Instructions</h1>
          <ol class='text-center'>
            {rules()[stage()].map((rule) => (
              <li>{rule.text}</li>
            ))}
          </ol>
        </>
      )}
      {/* {rules().map((stageRule, index) => (
        <div>
          <h2>Stage {displayPlusOne(index)}</h2>
          <ol>
            {stageRule.map((rule) => (
              <li>{rule.text}</li>
            ))}
          </ol>
        </div>
      ))} */}
    </div>
  )
}

export default App
