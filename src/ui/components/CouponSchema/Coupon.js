export let counponToPrint = (logoBase64, infos, montant, datelimite, title, qr, filename) => ({
    defaultFileName: filename,
        pageSize: {
        width: 450,
            height: 'auto'
    },
    fillColor: 'red',
        pageMargins: [35, 40, 35, 40],
            content: [
                {
                    image: "data:image/png;base64," + logoBase64,
                    width: 100,
                    style: { alignment: 'center' }
                },
                { lineHeight: 2, text: 'COUPON DE REDUCTION', fontSize: 15, style: { alignment: 'center', bold: true } },
                {
                    text: [
                        { text: infos+' \n', fontSize: 14, style: { alignment: 'center', bold: true } },
                        { text: 'Vous béneficiez d\'une reduction de ' + montant +' \n', fontSize: 14, color: '#de0027', style: { alignment: 'center' } },
                        { text: 'Pour l\'annonce: ' + title +' \n', fontSize: 14, style: { alignment: 'center' } },
                        { text: '\nOffre valable jusqu\'au ' + datelimite +' sous présentation au guichet. \n\n', fontSize: 10, style: { italics: true, alignment: 'center' } }
                    ]
                },
                // { qr: qr, fit: '80', style: { alignment: 'center' } },
                { text: '\n www.entrecops.co', fontSize: 10, style: { italics: true, alignment: 'center' } }
            ]
})