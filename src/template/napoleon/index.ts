import Template from '..'

export default class NapoleonTemplate extends Template<NapoleonProduct, NapoleonHtmlProps> {
  name = 'christmas-toys'
  width = 1500
  height = 1500
  products: NapoleonProduct[] = []
  autoNumbering = true

  override async parseExcel(): Promise<NapoleonProduct[]> {
    const tmp: Record<string, any> = {}
    const mainSheet = this.workbook.getWorksheet(1)
    mainSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const values = row.values as Record<string, any>
      tmp[values[1]] = {
        id: values[1],
        name: values[2],
        photo: values[4],
        painting: values[3],
        factText: values[5],
        factValue: values[6].toString(),
        factValueOnTop: values[7],
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

    const result: Array<NapoleonProduct> = []
    for (var k in tmp) {
      result.push(tmp[k])
    }
    return result
  }

  override async processProduct(product: NapoleonProduct): Promise<void> {
    const filename = `${product.id} - ${product.name}`
    this.queueProduct({
      isMain: 'Да',
      title: product.name,
      painting: product.painting,
      photo: product.photo
    }, filename)

    product.additional.forEach((p: AdditionalPhoto) => {
      this.queueProduct({
        title: p.title,
        photo: p.photo
      }, filename)
    })
  }
}

export type NapoleonProduct = {
  id: string
  name: string
  painting: 'некрашеный' | 'сувенирный' | 'полуколлекционный' | 'коллекционный'
  photo: string
  additional: Array<AdditionalPhoto>
}

type AdditionalPhoto = {
  title: string
  photo: string
}

type NapoleonHtmlProps = {
  isMain?: 'Да' | 'Нет'
  title: string
  photo: string
  painting?: 'некрашеный' | 'сувенирный' | 'полуколлекционный' | 'коллекционный'
  factText?: string
  factValue?: string
  factValueOnTop?: 'Да' | 'Нет'
}
