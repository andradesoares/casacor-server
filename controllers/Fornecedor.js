const crypto = require('crypto');
const { Op } = require('sequelize');
const fs = require('fs');
const { google } = require('googleapis');

const { Fornecedor, Profissional, FornecedorProfissional } = require('../models');

const KEYFILEPATH = __dirname + '/../google-credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// const downloadFile = async (fileId, auth) => {
//   const driveService = google.drive({ version: 'v3', auth });

//   const file = fs.createWriteStream(__dirname + `/../images/logo.jpg`); // destination is path to a file

//   await driveService.files.get(
//     { fileId: fileId, alt: 'media' },
//     { responseType: 'stream' },
//     function (err, res) {
//       res.data
//         .on('end', () => {
//           console.log('Done');
//         })
//         .on('error', (err) => {
//           console.log('Error', err);
//         })
//         .pipe(file);
//     }
//   );
// };

const createAndUploadFile = async (auth, file, nome) => {
  const driveService = google.drive({ version: 'v3', auth });
  let fileMetaData = {
    name: `${nome}.jpg`,
    parents: ['1i54xyh3Q5oJMfyVqk1fURsR7cDc7PFtU'],
  };
  let media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream(file),
  };

  let response = await driveService.files.create({
    resource: fileMetaData,
    media: media,
    fields: 'id',
  });

  switch (response.status) {
    case 200:
      return response.data.id;
  }
};

const deleteFile = async (auth, fileId) => {
  const driveService = google.drive({ version: 'v3', auth });

  let response = await driveService.files.delete({
    fileId: fileId,
  });
};

module.exports = {
  lerUsuario: async (req, res, next) => {
    const { fornecedorId } = req.body;

    try {
      const usuario = await Fornecedor.findOne({
        attributes: { exclude: ['passord', 'createdAt', 'updatedAt'] },
        where: {
          fornecedor_userId: fornecedorId,
        },
      });

      // const response = await downloadFile(usuario.logo, auth);
      res.status(200).send({ usuario });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao encontrar usuarios' });
    }
  },

  lerConexoes: async (req, res, next) => {
    const { fornecedorId } = req.query;

    try {
      const profissionais = await Profissional.findAll({
        joinTableAttributes: ['status'],
        include: {
          model: Fornecedor,
          where: { fornecedor_userId: fornecedorId },
          required: false,
          attributes: ['fornecedor_userId', 'nome'],
        },
        attributes: ['profissional_userId', 'nome'],
        order: [['nome', 'ASC']],
      });

      const profissionaisAdicionados = profissionais.filter(
        (profissional) => profissional.Fornecedors[0]?.fornecedor_userId == fornecedorId
      );

      const profissionaisNaoAdicionados = profissionais.filter(
        (profissional) => profissional.Fornecedors[0]?.fornecedor_userId !== fornecedorId
      );

      res.status(200).send({ profissionaisAdicionados, profissionaisNaoAdicionados });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao encontrar usuarios' });
    }
  },
  adicionarProfissional: async (req, res, next) => {
    const { profissionalId, fornecedorId } = req.value.body;

    try {
      const usuarioProfissional = await Profissional.findOne({
        where: {
          profissional_userId: profissionalId,
        },
        attributes: ['profissional_userId', 'nome'],
      });

      const usuarioFornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: fornecedorId,
        },
        attributes: ['fornecedor_userId', 'nome'],
      });

      if (!usuarioFornecedor || !usuarioProfissional) {
        return res.status(422).send({ error: 'Usuario não encontrado' });
      }
      const id = crypto.randomBytes(32).toString('hex');

      await FornecedorProfissional.create({
        relacaoId: id,
        fornecedor_userId: fornecedorId,
        profissional_userId: profissionalId,
        status: 'pendente',
        iniciadoPor: 'fornecedor',
      });

      usuarioProfissional.dataValues.Fornecedors = [
        {
          usuarioFornecedor,
          FornecedorProfissional: {
            relacaoId: id,
            fornecedor_userId: fornecedorId,
            profissional_userId: profissionalId,
            status: 'pendente',
            iniciadoPor: 'fornecedor',
          },
        },
      ];

      res
        .status(200)
        .send({ message: 'Profissional adicionado', profissional: usuarioProfissional });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao adicionar usuario' });
    }
  },
  responderSolicitacaoProfissional: async (req, res, next) => {
    const { profissionalId, fornecedorId, resposta } = req.body;

    try {
      const usuarioProfissional = await Profissional.findOne({
        where: {
          profissional_userId: profissionalId,
        },
        attributes: ['profissional_userId', 'nome'],
      });

      const usuarioFornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: fornecedorId,
        },
        attributes: ['fornecedor_userId', 'nome'],
      });

      if (!usuarioFornecedor || !usuarioProfissional) {
        return res.status(422).send({ error: 'User não eonctrado' });
      }

      const conexao = await FornecedorProfissional.findOne({
        where: {
          fornecedor_userId: fornecedorId,
          profissional_userId: profissionalId,
        },
      });

      if (conexao) {
        if (conexao.dataValues.iniciadoPor == 'profissional') {
          if (resposta == 'confirmado') {
            conexao.status = 'confirmado';
            conexao.save();
          } else {
            conexao.destroy();
            return res.status(400).send({ error: 'Conexao terminada' });
          }
        } else {
          return res.status(400).send({ error: 'Conexao já existente' });
        }
      }

      usuarioProfissional.dataValues.Fornecedors = [
        {
          usuarioFornecedor,
          FornecedorProfissional: conexao.dataValues,
        },
      ];

      res
        .status(200)
        .send({ message: 'Profissional adicionado', profissional: usuarioProfissional });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao adicionar usuario' });
    }
  },
  cancelarConexaoIniciadaFornecedor: async (req, res, next) => {
    const { profissionalId, fornecedorId } = req.body;

    try {
      const usuarioProfissional = await Profissional.findOne({
        where: {
          profissional_userId: profissionalId,
        },
        attributes: ['profissional_userId', 'nome'],
      });

      const usuarioFornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: fornecedorId,
        },
        attributes: ['fornecedor_userId', 'nome'],
      });

      if (!usuarioFornecedor || !usuarioProfissional) {
        return res.status(422).send({ error: 'User não encontrado' });
      }

      const conexao = await FornecedorProfissional.findOne({
        where: {
          fornecedor_userId: fornecedorId,
          profissional_userId: profissionalId,
        },
      });

      if (conexao) {
        if (conexao.dataValues.iniciadoPor == 'fornecedor' && conexao.status == 'pendente') {
          conexao.destroy();
        }
        res.status(200).send({ message: 'Conexao Cancelada', profissional: usuarioProfissional });
      } else {
        return res.status(400).send({ error: 'Conexao não encontrada' });
      }
    } catch (error) {
      res.status(500).send({ error: 'Erro ao adicionar usuario' });
    }
  },

  fileUpload: async (req, res, next) => {
    try {
      const [file] = req.files;
      const { userId, nome } = req.body;

      const id = await createAndUploadFile(auth, `public/images/fornecedores/${nome}`, nome);
      console.log(id);

      await Fornecedor.update(
        { logo: id },
        {
          where: {
            fornecedor_userId: userId,
          },
        }
      );

      fs.rename(
        __dirname + `/../public/images/fornecedores/${nome}`,
        __dirname + `/../public/images/fornecedores/${id}.jpg`,
        () => {
          console.log('\nFile Renamed!\n');
        }
      );
      res.status(200).json({ message: 'Arquivo enviado.', id });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Erro enviando arquivo.' });
    }
  },

  fileDelete: async (req, res, next) => {
    try {
      const { logoId, userId } = req.body;

      await deleteFile(auth, logoId);

      await Fornecedor.update(
        { logo: null },
        {
          where: {
            fornecedor_userId: userId,
          },
        }
      );

      fs.unlinkSync(__dirname + `/../public/images/fornecedores/${logoId}.jpg`);

      res.status(200).json({ message: 'Arquivo excluido.' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Erro excluindo arquivo.' });
    }
  },
};
