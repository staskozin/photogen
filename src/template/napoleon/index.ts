import Template from '..'

export default class NapoleonTemplate extends Template<NapoleonProduct, NapoleonHtmlProps> {
  name = 'napoleon'
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
        type: values[2],
        name: values[3],
        painting: values[4],
        photo: values[5],
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
      id: product.id,
      type: product.type,
      title: product.name,
      painting: product.painting,
      photo: product.photo
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

export type NapoleonProduct = {
  id: string
  name: string
  type: 'набор' | 'солдатик' | 'диорама'
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
  type?: 'набор' | 'солдатик' | 'диорама'
  id?: string
  title: string
  photo: string
  painting: 'некрашеный' | 'сувенирный' | 'полуколлекционный' | 'коллекционный'
}
