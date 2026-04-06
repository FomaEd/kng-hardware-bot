// ============================================
// ЭКСПОРТ В EXCEL
// ============================================
function groupArticles(items, multiplier) {
    const map = new Map();

    items.forEach(item => {
        const key = item.article;
        if (!map.has(key)) {
            map.set(key, {
                article: item.article,
                name: item.name,
                qty: 0
            });
        }
        const entry = map.get(key);
        entry.qty += item.qty * multiplier;
    });

    return Array.from(map.values()).sort((a, b) => a.article.localeCompare(b.article));
}

    async function exportToExcel(excelData, alternativeData) {
    try {
        if (!Array.isArray(excelData) || excelData.length === 0) {
            throw new Error('Пустой набор данных для Excel');
        }
        if (typeof ExcelJS === 'undefined') {
            throw new Error('ExcelJS не загружен');
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Фурнитура');

        sheet.columns = [
            { key: 'A', width: 20 },
            { key: 'B', width: 55 },
            { key: 'C', width: 10 },
            { key: 'D', width: 5 },
            { key: 'E', width: 20 },
            { key: 'F', width: 55 },
            { key: 'G', width: 10 },
        ];

        const headerRow = sheet.addRow(['Артикул', 'Наименование', 'Кол-во']);
        headerRow.font = { bold: true };

        const yellowArticles = ['KN100OH', 'KN208AH'];

        excelData.forEach(item => {
            const row = sheet.addRow([item.article, item.name, item.qty]);
            if (yellowArticles.includes(item.article)) {
                row.eachCell({ includeEmpty: false }, cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFF00' }
                    };
                });
            }
        });

        if (alternativeData && alternativeData.length > 0) {
            const altHeaderCell = sheet.getCell('E1');
            altHeaderCell.value = 'Альтернатива для штульповой створки';
            altHeaderCell.font = { bold: true };

            alternativeData.forEach((item, i) => {
                const rowIndex = i + 2;
                const cellE = sheet.getCell(`E${rowIndex}`);
                const cellF = sheet.getCell(`F${rowIndex}`);
                const cellG = sheet.getCell(`G${rowIndex}`);

                cellE.value = item.article;
                cellF.value = item.name;
                cellG.value = item.qty;

                [cellE, cellF, cellG].forEach(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFF00' }
                    };
                });
            });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob(
            [buffer],
            { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `KNG_furnitura_${date}.xlsx`;
        a.click();

        // даём браузеру выполнить клик, потом чистим URL
        setTimeout(() => URL.revokeObjectURL(url), 0);

        return true;
    } catch (err) {
        console.error('Ошибка при формировании Excel:', err);
        showMessage('Не удалось сформировать Excel файл. Попробуйте ещё раз.', 'error');
        return false;
    }
}
