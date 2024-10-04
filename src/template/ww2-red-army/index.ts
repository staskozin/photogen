import Template from '..'

export default class WW2RedArmyTemplate extends Template<WW2RedArmyProduct, WW2RedArmyHtmlProps> {
  name = 'ww2-red-army'
  width = 1500
  height = 1500
  products: WW2RedArmyProduct[] = []
  autoNumbering = true

  override async parseExcel(): Promise<WW2RedArmyProduct[]> {
    const tmp: Record<string, any> = {}
    const mainSheet = this.workbook.getWorksheet(1)
    mainSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const values = row.values as Record<string, any>
      tmp[values[1]] = {
        id: values[1],
        topText: values[2],
        title: values[3],
        painting: values[4],
        quantity: values[5],
        photo: values[6],
        package: values[7],
        additional: []
      }
    })

    const additionalSheet = this.workbook.getWorksheet('Доп. фото')
    additionalSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const values = row.values as Record<string, any>
      tmp[values[1]].additional.push({
        title: values[3],
        photo: values[2]
      })
    })

    const result: Array<WW2RedArmyProduct> = []
    for (var k in tmp) {
      result.push(tmp[k])
    }
    return result
  }

  override async processProduct(product: WW2RedArmyProduct): Promise<void> {
    const filename = `${product.id} - ${product.title}`
    this.queueProduct({
      isMain: 'Да',
      topText: product.topText,
      title: product.title,
      painting: product.painting,
      quantity: product.quantity,
      photo: product.photo,
      package: product.package
    }, filename)

    product.additional.forEach((p: AdditionalPhoto) => {
      this.queueProduct({
        title: p.title,
        photo: p.photo,
        painting: product.painting
      }, filename)
    })
  }
}

export type WW2RedArmyProduct = {
  id: string
  topText: string
  title: string
  painting: 'Некрашеный' | 'Сувенирный' | 'Полуколлекционный' | 'Коллекционный'
  quantity: number
  photo: string
  package: 'Надёжная' | 'Подарочная'
  additional: Array<AdditionalPhoto>
}

type AdditionalPhoto = {
  title: string
  photo: string
}

type WW2RedArmyHtmlProps = {
  isMain?: 'Да' | 'Нет'
  topText?: string
  title: string
  painting: 'Некрашеный' | 'Сувенирный' | 'Полуколлекционный' | 'Коллекционный'
  quantity?: number
  photo: string
  package?: 'Надёжная' | 'Подарочная'
}
