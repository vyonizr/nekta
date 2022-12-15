import { createSignal, createMemo } from 'solid-js'
import type { Component } from 'solid-js'
import { MetaProvider, Title } from '@solidjs/meta'

import styles from './Memory.module.css'

import { IRulesPayload, IAnswer } from './types'
import {
  displayPlusOne,
  randomIntFromInterval,
  findValidator,
  hintTextGenerator,
  createRandomSequence,
} from './utils'
import { RULE_MODES } from './constants'

const App: Component = () => {
  const [currentDisplayedNumber, setCurrentDisplayedNumber] =
    createSignal<number>(randomIntFromInterval())
  const [stage, setStage] = createSignal(0)
  const [answers, setAnswers] = createSignal<IAnswer[]>([])
  const [strikes, setStrikes] = createSignal<number>(0)

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
    <MetaProvider>
      <Title>The Memory Module | Nekta</Title>
      <div class={styles.App}>
        <h2 class='text-2xl font-semibold'>The Memory Module</h2>
        <div class='flex w-56 flex-col'>
          <div class='my-2 w-full h-36 bg-slate-900 flex items-center justify-center relative'>
            <h3
              class={`text-2xl text-red-600 absolute top-0 right-2 ${
                strikes() === 2 && 'animate-blink'
              }`}
            >
              {Array(3 - strikes())
                .fill(1)
                .map(() => (
                  <>&#10084;</>
                ))}
            </h3>
            <h2 class='font-mono cursor-default text-6xl text-green-500'>
              {isFailed() ? <>&#9760;</> : currentDisplayedNumber}
            </h2>
            {!isFailed() && (
              <div class='self-center grid grid-cols-5 justify-between gap-3 absolute bottom-2'>
                {Array(5)
                  .fill(1)
                  .map((_, index) => (
                    <div
                      class={`${
                        index <= stage()
                          ? 'bg-green-500'
                          : 'border-2 border-green-500'
                      } w-4 h-4`}
                    />
                  ))}
              </div>
            )}
          </div>
          <div class='w-fit grid grid-cols-4 gap-x-3'>
            {sequence().map((label, index) => (
              <button
                class={`w-12 h-12 rounded font-bold text-2xl text-white bg-blue-500 ${
                  isFailed()
                    ? 'cursor-not-allowed'
                    : 'hover:bg-amber-300 hover:text-gray-900 hover:scale-110'
                } transition ease-in-out`}
                onclick={() => onClickLabel({ label, index })}
                disabled={isFailed()}
              >
                {isFailed() ? <>&#128937;</> : label}
              </button>
            ))}
          </div>
          {isFailed() && (
            <button class='mt-2 w-full h-12 bg-gray-300 rounded'>
              Try Again
            </button>
          )}
        </div>
        {!isFailed() && (
          <>
            <ul class='list-disc list-outside'>
              {rules()[stage()].map((rule) => (
                <li>{rule.text}</li>
              ))}
            </ul>
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
        <small>v{import.meta.env.PACKAGE_VERSION}</small>
      </div>
    </MetaProvider>
  )
}

export default App
