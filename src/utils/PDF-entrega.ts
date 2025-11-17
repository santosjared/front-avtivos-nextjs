import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: {
            finalY: number;
            [key: string]: number;
        };
    }
}

type TextSpan = {
    text: string
    font?: string
    style?: string
    textColor?: [number, number, number]
    bgColor?: [number, number, number]
}

interface SubCategoryType {
    _id?: string
    name: string
    util: number
}

interface ContableType {
    _id: string
    name: string,
    util: number,
    subcategory: SubCategoryType[]
    description?: string
}

interface StatusType {
    _id: string
    name: string
}

interface LocationType {
    _id: string
    name: string
}

interface GradeType {
    name: string
    _id: string
}

interface UserType {
    _id?: string
    grade: GradeType | null
    name: string
    ci: string
    lastName: string
    otherGrade?: string
}

interface InfoEntegaType {
    code: string
    date: string
    time: string
    user_en: UserType | null
    user_rec: UserType | null
    location: LocationType | null
    description: string
    otherLocation: string
}

interface ActivosType {
    _id?: string
    code: string,
    responsable: UserType | null,
    name: string,
    location: LocationType | null,
    price_a: number,
    date_a: string,
    imageUrl: string | null,
    status: StatusType | null
    category: ContableType | null
    subcategory: SubCategoryType | null
}

export const PDFEntrega = (info: InfoEntegaType | null, activos: ActivosType[]) => {

    const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });

    const cmToPt = (cm: number): number => cm * 28.35;

    const marginTop = cmToPt(2.5);
    const marginBottom = cmToPt(2.5);
    const marginLeft = cmToPt(2.5);
    const marginRight = cmToPt(2.5);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - marginLeft - marginRight;

    const fontSize = 10;
    const lineHeight = fontSize * 1.5;

    const header = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`Código: ${info?.code || ''}`, 60, 35);
    };

    const footer = () => {
        const text = `DIRECCION DEPARTAMENTAL DE BOMBEROS "CARACOLES POTOSI"`;
        const textWidth = doc.getTextWidth(text);
        const x = marginLeft + (usableWidth - textWidth - marginRight) / 2;
        const y = pageHeight - marginBottom + 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(text, x, y);
    };

    const addPageWithHeaderFooter = () => {
        doc.addPage();
        header();
        footer();
    };

    const drawJustifiedText = (
        spans: TextSpan[],
        defaultFont = "helvetica",
        defaultStyle = "normal"
    ) => {
        const words: { word: string, spanIndex: number }[] = [];

        spans.forEach((span, index) => {
            span.text.split(/\s+/).forEach(word => {
                if (word.trim()) words.push({ word, spanIndex: index });
            });
        });

        const spaceWidth = doc.getTextWidth(" ");
        const maxExtraSpace = spaceWidth * 2;
        let lineWords: typeof words = [];
        let currentLineWidth = 0;

        const drawLine = (lineWords: typeof words, justify: boolean) => {
            const textLine = lineWords.map(w => w.word).join(" ");
            const textWidth = doc.getTextWidth(textLine);
            const spaceCount = lineWords.length - 1;
            let extraSpace = 0;

            if (justify && spaceCount > 0) {
                extraSpace = (usableWidth - textWidth) / spaceCount;
                if (extraSpace > maxExtraSpace) {
                    extraSpace = 0;
                    justify = false;
                }
            }

            let x = marginLeft;

            for (let i = 0; i < lineWords.length; i++) {
                const { word, spanIndex } = lineWords[i];
                const span = spans[spanIndex];

                const font = span.font || defaultFont;
                const style = span.style || defaultStyle;
                const textColor = span.textColor || [0, 0, 0];
                const bgColor = span.bgColor;

                const wordWidth = doc.getTextWidth(word);
                const padding = 1;

                if (bgColor) {
                    doc.setFillColor(...bgColor);
                    doc.rect(x - padding, cursorY - fontSize + 2, wordWidth + 2 * padding, fontSize + 2, "F");
                }

                doc.setFont(font, style);
                doc.setTextColor(...textColor);
                doc.text(word, x, cursorY);

                x += wordWidth + spaceWidth + (justify ? extraSpace : 0);
            }

            cursorY += lineHeight;
        };

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordWidth = doc.getTextWidth(word.word);
            const totalWidth = wordWidth + spaceWidth;

            if (currentLineWidth + totalWidth > usableWidth) {
                drawLine(lineWords, true);
                lineWords = [];
                currentLineWidth = 0;

                if (cursorY + lineHeight > pageHeight - marginBottom) {
                    addPageWithHeaderFooter();
                    cursorY = marginTop + 40;
                    doc.setFontSize(fontSize);
                }
            }

            lineWords.push(word);
            currentLineWidth += totalWidth;
        }

        if (lineWords.length > 0) {
            drawLine(lineWords, false);
        }

        doc.setFont(defaultFont, defaultStyle);
        doc.setTextColor(0, 0, 0);
    };



    header();
    footer();

    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    const title = `ACTA DE ENTREGA`
    const titleWidth = doc.getTextWidth(title);
    const titleX = marginLeft + (usableWidth - titleWidth) / 2;
    let cursorY = marginTop + 10;
    doc.text(title, titleX, cursorY);

    cursorY += 20;

    drawJustifiedText([
        { text: "En la ciudad de " },
        { text: `Potosí, `, style: "bolditalic" },
        { text: `a horas ` },
        { text: `${info?.time || '00:00'} `, style: 'bolditalic' },
        { text: `del día ` },
        { text: `${formatear(info?.date || '17/11/2025')} `, style: 'bolditalic' },
        { text: `se procede a la ENTREGA DE BIENES de conformidad con las disposiciones del ` },
        { text: `D.S. Nº 0181, `, style: 'bolditalic' },
        { text: `Normas Básicas del Sistema de Administración de Bienes y Servicios, en particular los artículos relativos al Documento de Entrega y la Liberación de Responsabilidad.` }
    ]);

    cursorY += 10

    drawJustifiedText([{ text: `ENTREGA:`, style: 'bolditalic' }]);

    cursorY += 10

    drawJustifiedText([
        { text: 'El/la suscrito(a)' },
        { text: `${info?.user_en?.grade?.name || ''} ${info?.user_en?.name || ''} ${info?.user_en?.lastName || ''}`, style: 'bolditalic' },
        { text: '\u00A0' },
        { text: 'con cédula de identidad' },
        { text: `${info?.user_en?.ci || '[C.I.]'} `, style: 'bolditalic' },
        { text: 'hace la entrega de los siguientes bienes a la ' },
        { text: `Unidad de: ${info?.otherLocation || info?.location?.name || ''}. `, style: 'bolditalic' }
    ])

    cursorY += 10

    drawJustifiedText([{ text: `RECIBE:`, style: 'bolditalic' }]);

    cursorY += 10

    drawJustifiedText([
        { text: 'El/la suscrito(a)' },
        { text: `${info?.user_rec?.grade?.name || ''} ${info?.user_rec?.name || ''} ${info?.user_rec?.lastName || ''} `, style: 'bolditalic' },
        { text: ' con cédula de identidad' },
        { text: `${info?.user_rec?.ci || '[C.I.]'}, `, style: 'bolditalic' },
        { text: 'bajo su responsabilidad de custodia y uso conforme a las normas vigentes.' },
    ])

    cursorY += 10

    drawJustifiedText([{ text: `DETALLE DE LOS BIENES ENTREGADOS:`, style: 'bolditalic' }]);



    const head = [['CÓDIGO', 'NOMBRE', 'LUGAR DEL ACTIVO', 'LUGAR DE ENTREGA', 'OBSERVACIONES', 'DESCRIPCIÓN']];

    const body: any[] = [];

    activos.forEach((item, index) => {
        body.push([
            item.code ?? "",
            item.name ?? "",
            item.location?.name ?? "",
            info?.otherLocation || info?.location?.name || "",
            " ",
            index === 0
                ? {
                    content: info?.description ?? "",
                    rowSpan: activos.length,
                    styles: { valign: "top" }
                }
                : ""
        ]);
    });


    autoTable(doc, {
        startY: cursorY,
        head,
        body,
        margin: { left: marginLeft, right: marginRight },
        theme: 'plain',
        styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 4,
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: false,
            textColor: [0, 0, 0],
            fontStyle: 'bolditalic'
        },
        didDrawPage: () => {
            header();
            footer();
        }
    });

    cursorY = doc.lastAutoTable.finalY + 20;

    drawJustifiedText([
        { text: "Se deja constancia que la entrega se realiza en " },
        { text: `perfectas condiciones `, style: "bolditalic" },
        { text: `de uso o conforme a lo observado en la columna de “Observaciones”. Ambas partes liberan de responsabilidad respecto a daños o pérdidas posteriores a la entrega, salvo los estipulados en la normativa vigente.` },
    ]);

    const firmasHeight = 70;

    if (cursorY + firmasHeight + 20 > pageHeight - marginBottom) {
        addPageWithHeaderFooter();
        cursorY = marginTop + 40;
    }

    cursorY += 50;

    const espacioEntreFirmas = 80;
    const anchoFirma = (usableWidth - espacioEntreFirmas) / 2;

    const xFirma1 = marginLeft;
    const xFirma2 = marginLeft + anchoFirma + espacioEntreFirmas;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);

    doc.line(xFirma1, cursorY, xFirma1 + anchoFirma, cursorY);

    doc.line(xFirma2, cursorY, xFirma2 + anchoFirma, cursorY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);

    const nombreRec = `${info?.user_rec?.grade?.name || ""} ${info?.user_rec?.name || ""} ${info?.user_rec?.lastName || ""}`;

    const nombreEnt = `${info?.user_en?.grade?.name || ""} ${info?.user_en?.name || ""} ${info?.user_en?.lastName || ""}`;

    const nombreRecWidth = doc.getTextWidth(nombreRec);
    const nombreEntWidth = doc.getTextWidth(nombreEnt);

    const nombreRecX = xFirma1 + (anchoFirma - nombreRecWidth) / 2;
    const nombreEntX = xFirma2 + (anchoFirma - nombreEntWidth) / 2;

    doc.text(nombreRec, nombreRecX, cursorY + 12);
    doc.text(nombreEnt, nombreEntX, cursorY + 12);

    const recibi = "RECIBÍ CONFORME";
    const entregue = "ENTREGUÉ CONFORME";

    const recibiWidth = doc.getTextWidth(recibi);
    const entregueWidth = doc.getTextWidth(entregue);

    const recibiX = xFirma1 + (anchoFirma - recibiWidth) / 2;
    const entregueX = xFirma2 + (anchoFirma - entregueWidth) / 2;

    doc.text(recibi, recibiX, cursorY + 22);
    doc.text(entregue, entregueX, cursorY + 22);


    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const printWindow = window.open(pdfUrl);
    if (printWindow) {
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    }
}

const formatear = (f: string | Date) => {
    const fecha = new Date(f);
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
};

