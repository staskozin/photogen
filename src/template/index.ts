import fse from 'fs-extra'
import path from 'path'
import { Cluster } from 'puppeteer-cluster'
import Excel from 'exceljs'

export default abstract class Template<Product, HtmlProps> {
  protected abstract name: string
  protected abstract width: number
  protected abstract height: number
  protected abstract products: Product[]
  protected abstract autoNumbering: boolean

  // Наполняем массив products данными из эксельки
  protected abstract parseExcel(): Promise<Product[]>

  // Генерируем картинку по шаблону, для создания картинки в ней нужно вызывать queueProduct()
  protected abstract processProduct(product: Product): Promise<void>

  // Объекты, которые нужны в работе шаблона
  protected workbook!: Excel.Workbook // Объявляется в processExcel
  private cluster!: Cluster // Объявляется в processPhotos

  // Создаёт картинку
  protected queueProduct(htmlProps: HtmlProps, filename: string): void {
    const picturePath = this.autoNumbering ? `${this.resultPath}/${filename} - ${this.fileNumber++}.jpg` : `${this.resultPath}/${filename}.jpg`
    this.cluster.queue(null, async ({ page }) => {
      await page.goto(`file://${path.join(__dirname, '..', 'html', this.name, 'index.html')}?${this.getUrlParams(htmlProps)}`)
      await page.screenshot({ 'fullPage': true, 'path': picturePath, 'quality': 100 })
      await page.close()
    })
  }

  // Функция, которая принимает на вход GET-параметры веб-страницы в виде объекта, передавать в queueProduct
  private getUrlParams(htmlProps: HtmlProps): string {
    return new URLSearchParams(htmlProps as any).toString()
  }

  // Счётчик для нумерации в названиях файлов
  private fileNumber: number = 1

  // Пути к эксельке и папкам с фотками
  private excelPath: string
  private photosPath: string
  private resultPath: string

  constructor(excelPath: string, photosPath: string, resultPath: string) {
    this.excelPath = excelPath
    this.photosPath = photosPath
    this.resultPath = resultPath
  }

  // Главный метод, который будет вызывать клиент
  public async process(): Promise<void> {
    await this.processExcel()
    await this.processPhotos()
  }

  // Запуск процесса получения информации из экселя
  private async processExcel(): Promise<void> {
    this.workbook = new Excel.Workbook()
    await this.workbook.xlsx.readFile(this.excelPath)
    this.products = await this.parseExcel()
  }

  // Запуск процесса генерации картинок
  private async processPhotos(): Promise<void> {
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: 5,
      puppeteerOptions: {
        defaultViewport: { width: this.width, height: this.height },
        headless: true
      }
    })

    this.movePhotos()

    this.products.forEach(product => {
      if (this.autoNumbering)
        this.fileNumber = 1
      this.processProduct(product)
    })

    await this.cluster.idle()
    await this.cluster.close()
    this.clearPhotos()
  }

  // Перемещаем фото из photosPath в html/${this.name}/temp
  private movePhotos(): void {
    this.clearPhotos()
    fse.copySync(this.photosPath, path.join(__dirname, '..', 'html', this.name, 'temp'))
  }

  // Очищаем html/${this.name}/temp
  private clearPhotos(): void {
    fse.removeSync(path.join(__dirname, '..', 'html', this.name, 'temp'))
  }
}
