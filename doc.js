var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};

var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts);
var fs = require('fs');

var docDefinition = {
	content: [{
		columns: [
            {
                table: {
                    widths: ['auto', '*'],
                    body: [
                        [ 
                        {
                            image: 'logo.png',
                            width: 50
                        }, 
                        {
                            width: '*',
                            alignment: 'center',
                            stack: [
                                {
                                    style: 'h1',
                                    text: 'Comision Reguladora de Energia'
                                },
                                {
                                    style: 'h2',
                                    text: 'ACUSE DE RECIBO'
                                },
                                {
                                    style: 'h2',
                                    text: 'Envio de Correspondencia Digital'
                                }
                            ]
                        }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: function(line) { return line === 1; },
                    vLineWidth: function() { return 0; },
                    paddingBottom: function() { return 5; }
                }
            }
          ]
    }]
};

var pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream('basics.pdf'));
pdfDoc.end();