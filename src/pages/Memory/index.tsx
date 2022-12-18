import { createSignal, createMemo } from 'solid-js'
import type { Component } from 'solid-js'
import { MetaProvider, Title } from '@solidjs/meta'

import {
  SECONDS_ADDED,
  MID_GAME_COUNTDOWN_START,
  INITIAL_COUNTDOWN_START,
} from './constants'
import { IRulesPayload, IAnswer } from './types'
import {
  randomIntFromInterval,
  createRandomSequence,
  generateRules,
} from './utils'

const App: Component = () => {
  const [currentDisplayedNumber, setCurrentDisplayedNumber] =
    createSignal<number>(randomIntFromInterval())
  const [stage, setStage] = createSignal(0)
  const [answers, setAnswers] = createSignal<IAnswer[]>([])
  const [strikes, setStrikes] = createSignal<number>(0)
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [rules, setRules] = createSignal<IRulesPayload[][]>(generateRules())
  const [countDown, setCountdown] = createSignal<number>(
    INITIAL_COUNTDOWN_START
  )
  const [sequence, setSequence] = createSignal<number[]>(createRandomSequence())
  const [isGameStarted, setIsGameStarted] = createSignal<boolean>(false)

  const isCompleted = createMemo(() => stage() === 5)
  const isFailed = createMemo(
    () => strikes() === 3 || (countDown() === 0 && !isCompleted())
  )
  const isInstructionVisible = createMemo(
    () => isGameStarted() && !(isFailed() || isCompleted() || isLoading())
  )
  const isLabelButtonDisabled = createMemo(
    () => !isGameStarted() || isFailed() || isCompleted() || isLoading()
  )
  const isRestartButtonVisible = createMemo(
    () => isGameStarted() && (isFailed() || isCompleted())
  )

  function decrementCountdown() {
    if (countDown() > 0) {
      setCountdown((currentTime) => currentTime - 1)
    }
  }

  let triggerTimer: number

  function startGame() {
    triggerTimer = setInterval(decrementCountdown, 1000)
    setIsGameStarted(true)
  }

  function onClickLabel(answer: IAnswer) {
    const instructionTruth = rules()[stage()][currentDisplayedNumber() - 1]
    const correctAnswer = generateCorrectAnswer()
    const isCorrect = instructionTruth.validator(correctAnswer, answer)
    setIsLoading(true)

    if (isCorrect) {
      setCountdown((current) => current + SECONDS_ADDED)
      setAnswers((current) => [...current, answer])
      setStage((current) => current + 1)
    } else {
      if (stage() > 0 && strikes() < 2) {
        setStage(0)
        setAnswers([])
      }

      setStrikes((current) => current + 1)
      setCountdown(MID_GAME_COUNTDOWN_START)
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
    clearInterval(triggerTimer)
    setStage(0)
    setStrikes(0)
    setCountdown(INITIAL_COUNTDOWN_START)
    setSequence(createRandomSequence())
    setAnswers([])
    setCurrentDisplayedNumber(randomIntFromInterval())
    setRules(generateRules())
    triggerTimer = setInterval(decrementCountdown, 1000)
  }

  return (
    <MetaProvider>
      <Title>The Memory Module | Nekta</Title>
      <div class='flex flex-col items-center'>
        <h2 class='text-2xl font-semibold'>The Memory Module</h2>
        <div class='flex flex-col items-center'>
          <div class='text-green-500 cursor-default my-2 w-72 h-36 bg-slate-900 rounded-lg flex items-center justify-center relative select-none'>
            {isGameStarted() && (
              <>
                {isFailed() ? (
                  <h2 class='text-5xl'>&#9760;</h2>
                ) : isCompleted() ? (
                  <h2 class='font-mono text-5xl'>&#129395;</h2>
                ) : (
                  <h2 class='font-mono text-7xl'>
                    {!isLoading() && currentDisplayedNumber()}
                  </h2>
                )}
                {!isFailed() && !isCompleted() && (
                  <>
                    <h2 class='font-mono absolute text-xl top-0 left-2'>
                      &#x23F1;{countDown()}
                    </h2>
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
                  </>
                )}
                <div class='self-center grid grid-cols-5 justify-between gap-5 absolute bottom-2'>
                  {Array(5)
                    .fill(1)
                    .map((_, index) => (
                      <div
                        class={`${
                          index < stage() && 'bg-green-500'
                        } border-2 border-green-500 w-4 h-4 transition ease-linear ${
                          index === stage() && !isFailed() && 'animate-blink'
                        }`}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
          <div class='w-fit grid grid-cols-4 gap-x-3'>
            {sequence().map((label, index) => (
              <button
                class={`w-12 h-12 rounded font-bold text-2xl transition ease-in-out text-white ${
                  isLabelButtonDisabled()
                    ? 'cursor-not-allowed'
                    : 'hover:bg-amber-300 hover:text-gray-900 hover:scale-110'
                } ${
                  !isGameStarted() || isFailed() || isCompleted()
                    ? 'bg-blue-300'
                    : 'bg-blue-500'
                }`}
                onclick={() => onClickLabel({ label, index })}
                disabled={isLabelButtonDisabled()}
              >
                {!isGameStarted() || isFailed() || isCompleted() ? (
                  <>&#215;</>
                ) : isLoading() ? (
                  <>&plus;</>
                ) : (
                  label
                )}
              </button>
            ))}
          </div>
          {isRestartButtonVisible() && (
            <button
              onClick={restartGame}
              class='mt-2 w-full h-12 bg-gray-200 font-bold rounded hover:bg-gray-300'
            >
              {isFailed() ? 'Try Again' : 'Start Over'}
            </button>
          )}
          {!isGameStarted() && (
            <button
              onClick={startGame}
              class='mt-2 w-full h-12 font-bold text-white bg-blue-500 rounded hover:bg-blue-600'
            >
              Start Game
            </button>
          )}
        </div>
        {isInstructionVisible() && (
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
