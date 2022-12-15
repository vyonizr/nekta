import { RULE_MODES } from './constants'
import { IRulesPayload } from './types'
import {
  displayPlusOne,
  randomIntFromInterval,
  findValidator,
  hintTextGenerator,
} from './utils'

export function generateDummyRules(): IRulesPayload[][] {
  const rules: IRulesPayload[][] = []

  for (let i = 0; i < 5; i++) {
    const stageRule: IRulesPayload[] = []

    for (let j = 0; j < 4; j++) {
      // HARDCODE FOR FIRST MODE
      // const ruleModeIndex = 0
      // const usedMode = RULE_MODES[ruleModeIndex]
      // const yVal = randomIntFromInterval(1, 4)

      // HARDCODE FOR SECOND MODE
      // const ruleModeIndex = 1
      // const usedMode = RULE_MODES[ruleModeIndex]
      // const yVal = randomIntFromInterval(0, 3)

      // HARDCODE FOR THIRD MODE
      // const includePreviousStage = rules.length >= 1 && Math.random() < 0.7
      // const maxIndex = includePreviousStage ? 4 : 1
      const ruleModeIndex = i >= 1 ? 2 : randomIntFromInterval(0, 0)
      const usedMode = RULE_MODES[ruleModeIndex]
      console.log(usedMode)
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
