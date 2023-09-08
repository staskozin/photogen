import Template from '..'

export default class ChristmasToysTemplate extends Template<ChristmasToysProduct, ChristmasToysHtmlProps> {
  name = 'christmas-toys'
  width = 1500
  height = 1500
  products: ChristmasToysProduct[] = []
  autoNumbering = true

  override async parseExcel(): Promise<ChristmasToysProduct[]> {
    const tmp: Record<string, any> = {}
    const mainSheet = this.workbook.getWorksheet(1)
    mainSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const values = row.values as Record<string, any>
      tmp[values[1]] = {
        id: values[1],
        title: values[3],
        photo: values[4],
        colorLight: values[11],
        colorDark: values[12],
        colorMiddle: values[13],
        topText: values[2],
        treeBackground: values[5],
        package: values[6],
        factText: values[7],
        factValue: values[8].toString(),
        factUnit: values[9],
        factValueOnTop: values[10],
        additional: []
      }
    })

    const additionalSheet = this.workbook.getWorksheet('Доп. фото')
    additionalSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const values = row.values as Record<string, any>
      tmp[values[1]].additional.push({
        title: values[3],
        photo: values[2],
        colorLight: tmp[values[1]].colorLight,
        colorDark: tmp[values[1]].colorDark,
        colorMiddle: tmp[values[1]].colorMiddle
      })
    })

    const result: Array<ChristmasToysProduct> = []
    for (var k in tmp) {
      result.push(tmp[k])
    }
    return result
  }

  override async processProduct(product: ChristmasToysProduct): Promise<void> {
    const filename = `${product.id} - ${product.title}`
    this.queueProduct({
      isMain: 'Да',
      title: product.title,
      topText: product.topText,
      photo: product.photo,
      colorLight: product.colorLight,
      colorDark: product.colorDark,
      colorMiddle: product.colorMiddle,
      treeBackground: product.treeBackground,
      package: product.package,
      factText: product.factText,
      factValue: product.factValue,
      factUnit: product.factUnit,
      factValueOnTop: product.factValueOnTop
    }, filename)

    product.additional.forEach((p: AdditionalPhoto) => {
      this.queueProduct({
        title: p.title,
        photo: p.photo,
        colorLight: p.colorLight,
        colorDark: p.colorDark,
        colorMiddle: p.colorMiddle
      }, filename)
    })
  }
}

export type ChristmasToysProduct = {
  id: string
  title: string
  photo: string
  colorLight: string
  colorDark: string
  colorMiddle: string
  topText: string
  treeBackground: 'Да' | 'Нет'
  package: 'Надёжная' | 'Подарочная'
  factText: string
  factValue: string
  factUnit?: string
  factValueOnTop: 'Да' | 'Нет'
  additional: Array<AdditionalPhoto>
}

type AdditionalPhoto = {
  title: string
  photo: string
  colorLight: string
  colorDark: string
  colorMiddle: string
}

type ChristmasToysHtmlProps = {
  isMain?: 'Да' | 'Нет'
  title: string
  photo: string
  topText?: string
  treeBackground?: 'Да' | 'Нет'
  package?: 'Надёжная' | 'Подарочная'
  factText?: string
  factValue?: string
  factUnit?: string
  factValueOnTop?: 'Да' | 'Нет'
  colorLight: string
  colorDark: string
  colorMiddle: string
}
