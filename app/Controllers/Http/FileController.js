'use strict';

const File = use('App/Models/File');
const Helpers = use('Helpers');

class FileController {
  async show({ response, params }) {
    const file = await File.findOrFail(params.id);
    return response.download(Helpers.tmpPath(`uploads/${file.file}`));
  }
  async store({ request, response }) {
    try {
      if (!request.file('file')) return;

      const upload = request.file('file', { size: '2mb' });
      const name = upload.clientName.split('.')[0];
      const fileName = `${Date.now()}-${name}.${upload.subtype}`;
      await upload.move(Helpers.tmpPath('uploads'), {
        name: fileName,
      });

      if (!upload.moved()) {
        throw upload.error();
      }
      const file = await File.create({
        file: fileName,
        name: upload.clientName,
        type: upload.type,
        subtype: upload.subtype,
      });

      return file;
    } catch (error) {
      return response
        .status(error.status)
        .send({ error: { message: 'Erro no upload de arquivo' } });
    }
  }

  async destroy({ params, request, response }) {}
}

module.exports = FileController;
