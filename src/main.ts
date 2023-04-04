import { program } from 'commander'
import { existsSync, mkdirSync } from 'fs'
import Template from './template'

program.requiredOption('-t, --template <name>', 'Название шаблона (можно посмотреть в папках html или template)')
program.requiredOption('-e, --excel <path>', 'Файл с описанием фотографий')
program.requiredOption('-p, --photos <path>', 'Папка с фотографиями')
program.requiredOption('-r, --result <path>', 'Папка, в которую будет помещён результат')
program.parse()
const options = program.opts();

(async () => {
  if (!existsSync(options.result))
    mkdirSync(options.result)

  const selectedTemplate = (await import(`./template/${options.template}`)).default
  const template: Template<unknown, unknown> = new selectedTemplate(options.excel, options.photos, options.result)
  await template.process()
})()
