import { createSignal, createMemo } from 'solid-js'
import type { Component } from 'solid-js'
import { MetaProvider, Title } from '@solidjs/meta'

import { RULE_MODES } from './constants'
import { IRulesPayload, IAnswer } from './types'
import {
  displayPlusOne,
  randomIntFromInterval,
  findValidator,
  hintTextGenerator,
  createRandomSequence,
} from './utils'

const App: Component = () => {
  const [currentDisplayedNumber, setCurrentDisplayedNumber] =
    createSignal<number>(randomIntFromInterval())
  const [stage, setStage] = createSignal(0)
  const [answers, setAnswers] = createSignal<IAnswer[]>([])
  const [strikes, setStrikes] = createSignal<number>(0)
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  // const [countDown, setCountdown] = createSignal<number>(10)

  const isFailed = createMemo(() => strikes() === 3)
  const isCompleted = createMemo(() => stage() === 5)

  const [sequence, setSequence] = createSignal<number[]>(createRandomSequence())

  // createEffect(() => {
  //   if (countDown() > 0) {
  //     const interval = setInterval(() => {
  //       setCountdown((currentTime) => currentTime - 1)
  //     }, 1000)
  //     onCleanup(() => clearInterval(interval))
  //   }
  // })

  function generateRules() {
    const rules: IRulesPayload[][] = []

    for (let i = 0; i < 5; i++) {
      const stageRule: IRulesPayload[] = []

      for (let j = 0; j < 4; j++) {
        const isPreviousStageAppear = Math.random() < 1 * (i / 4)
        const ruleModeIndex = isPreviousStageAppear
          ? randomIntFromInterval(2, 3)
          : randomIntFromInterval(0, 1)
        const usedMode = RULE_MODES[ruleModeIndex]
        const yVal =
          ruleModeIndex > 1
            ? randomIntFromInterval(0, i - 1)
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

  const [rules, setRules] = createSignal<IRulesPayload[][]>(generateRules())

  function onClickLabel(answer: IAnswer) {
    const instructionTruth = rules()[stage()][currentDisplayedNumber() - 1]
    const correctAnswer = generateCorrectAnswer()
    const isCorrect = instructionTruth.validator(correctAnswer, answer)
    setIsLoading(true)

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

    setTimeout(() => setIsLoading(false), 100)
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

  function restartGame() {
    setStage(0)
    setStrikes(0)
    setSequence(createRandomSequence())
    setAnswers([])
    setCurrentDisplayedNumber(randomIntFromInterval())
    setRules(generateRules())
  }

  return (
    <MetaProvider>
      <div class='flex flex-col items-center'>
        <Title>The Memory Module | Nekta</Title>
        <h2 class='text-2xl font-semibold'>The Memory Module</h2>
        <div class='flex flex-col items-center'>
          <div class='my-2 w-72 h-36 bg-slate-900 rounded-lg flex items-center justify-center relative select-none'>
            <h3
              class={`text-xl text-red-600 absolute top-0 right-2 ${
                strikes() === 2 && 'animate-blink'
              }`}
            >
              {Array(3 - strikes())
                .fill(1)
                .map(() => (
                  <>&#10084;</>
                ))}
            </h3>
            {isFailed() ? (
              <h2 class='cursor-default text-5xl text-green-500'>&#9760;</h2>
            ) : isCompleted() ? (
              <h2 class='font-mono cursor-default text-5xl text-green-500'>
                &#129395;
              </h2>
            ) : (
              <h2 class='font-mono cursor-default text-7xl text-green-500'>
                {!isLoading() && currentDisplayedNumber()}
              </h2>
            )}
            {!isFailed() && (
              <div class='self-center grid grid-cols-5 justify-between gap-5 absolute bottom-2'>
                {Array(5)
                  .fill(1)
                  .map((_, index) => (
                    <div
                      class={`${
                        index < stage() && 'bg-green-500'
                      } border-2 border-green-500 w-4 h-4 transition ease-linear ${
                        index === stage() && 'animate-blink'
                      }`}
                    />
                  ))}
              </div>
            )}
          </div>
          <div class='w-fit grid grid-cols-4 gap-x-3'>
            {sequence().map((label, index) => (
              <button
                class={`w-12 h-12 rounded font-bold text-2xl transition ease-in-out text-white ${
                  isFailed() || isCompleted() || isLoading()
                    ? 'cursor-not-allowed'
                    : 'hover:bg-amber-300 hover:text-gray-900 hover:scale-110'
                } ${
                  isFailed() || isCompleted() ? 'bg-blue-300' : 'bg-blue-500'
                }`}
                onclick={() => onClickLabel({ label, index })}
                disabled={isFailed() || isCompleted() || isLoading()}
              >
                {isFailed() || isCompleted() ? (
                  <>&#215;</>
                ) : isLoading() ? (
                  <>&plus;</>
                ) : (
                  label
                )}
              </button>
            ))}
          </div>
          {(isFailed() || isCompleted()) && (
            <button
              onClick={restartGame}
              class='mt-2 w-full h-12 bg-gray-200 rounded hover:bg-gray-300'
            >
              {isFailed() ? 'Try Again' : 'Start Over'}
            </button>
          )}
        </div>
        {!(isFailed() || isCompleted() || isLoading()) && (
          <section class={`mt-4 border-2 border-slate-900 bg-gray-100`}>
            <ul class='text-center divide-y divide-dashed divide-slate-900'>
              {rules()[stage()].map((rule) => (
                <li class='p-2'>{rule.text}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </MetaProvider>
  )
}

export default App
