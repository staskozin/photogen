export type GzhelProduct = {
  name: string
  collection: string
  quantity: string
  box: 'Фанерная' | 'Картонная' | 'Фанерный домик'
  photos: {
    onBox: string
    insideBox: string
    front: string
    back: string
    frontWithRuler: string
    backWithRuler: string
    box: string
    boxWithShavings: string
    onTree: string
  }
}

type GzhelHtmlProps = {
  name: string
  collection: string
  quantity: string
  box: 'Фанерная' | 'Картонная' | 'Фанерный домик'
  photo: string
  icon?: 'paintbrush' | 'leaf' | 'tree' | 'check' | 'gift' | 'shield'
  text: string
}
