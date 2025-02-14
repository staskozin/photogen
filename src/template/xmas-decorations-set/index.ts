import Template from '..'

export default class XmasDecorationsSetTemplate extends Template<XmasDecorationsSetProduct, XmasDecorationsSetHtmlProps> {
  name = 'xmas-decorations-set'
  width = 1500
  height = 2000
  products: XmasDecorationsSetProduct[] = []
  autoNumbering = true

  override async parseExcel(): Promise<XmasDecorationsSetProduct[]> {
    const tmp: Record<string, any> = {}
    const mainSheet = this.workbook.getWorksheet(1)!
    mainSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const values = row.values as Record<string, any>
      tmp[values[1]] = {
        id: values[1],
        textTop: values[2],
        text: values[3],
        textBottom: values[4],
        quantity: values[5],
        height: values[6],
        photo: values[7],
        color: values[8],
        additional: []
      }
    })

    const additionalSheet = this.workbook.getWorksheet('Доп. фото')!
    additionalSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const values = row.values as Record<string, any>
      tmp[values[1]].additional.push({
        text: values[3],
        photo: values[2],
        color: tmp[values[1]].color,
      })
    })

    const result: Array<XmasDecorationsSetProduct> = []
    for (var k in tmp) {
      result.push(tmp[k])
    }
    return result
  }

  override async processProduct(product: XmasDecorationsSetProduct): Promise<void> {
    const filename = `${product.id} - ${product.text.replaceAll("<br>", " ")}`
    this.queueProduct({
      isMain: 'Да',
      text: product.text,
      photo: product.photo,
      color: product.color,
      textTop: product.textTop,
      textBottom: product.textBottom,
      quantity: product.quantity,
      height: product.height,
    }, filename)

    product.additional.forEach((p: AdditionalPhoto) => {
      this.queueProduct({
        text: p.text,
        photo: p.photo,
        color: p.color
      }, filename)
    })
  }
}

export type XmasDecorationsSetProduct = {
  id: string
  textTop: string
  text: string
  textBottom: string
  quantity: number
  height: string
  photo: string
  color: string
  additional: Array<AdditionalPhoto>
}

type AdditionalPhoto = {
  text: string
  photo: string
  color: string
}

type XmasDecorationsSetHtmlProps = {
  text: string
  photo: string
  color: string
  isMain?: 'Да' | 'Нет'
  textTop?: string
  textBottom?: string
  quantity?: number
  height?: string
}
