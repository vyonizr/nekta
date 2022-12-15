export type TRuleMode =
  | 'position-y'
  | 'label-y'
  | 'position-stage-y'
  | 'label-stage-y'

export type TValidatorFn = (
  correctAnswer: IAnswer,
  selectedAnswer: IAnswer
) => boolean

export interface IRulesPayload {
  text: string
  validator: (correctAnswer: IAnswer, selectedAnswer: IAnswer) => boolean
  mode: TRuleMode
  yVal: number
}

export interface IAnswer {
  label: number
  index: number
}
