
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils';
import { LaporanKasResult } from '@/actions/keuangan/laporan';

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        paddingBottom: 60,
    },
    header: {
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
        lineHeight: 1.2,
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginTop: 4,
    },
    subHeader: {
        marginTop: 10,
        marginBottom: 10,
        fontSize: 10,
    },
    // Table
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 4,
    },
    tableColHeader: {
        backgroundColor: '#f3f4f6',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 9,
        paddingVertical: 6,
    },
    // Column Widths (Total 100%) - 6 Columns
    colTgl: { width: '13%' },
    colUraian: { width: '37%' },
    colNoBukti: { width: '12%' },
    colNominal: { width: '13%', textAlign: 'right' },
    colSaldo: { width: '12%', textAlign: 'right' },

    // Footer
    footerSection: {
        marginTop: 10,
    },
    summaryTable: {
        marginTop: 5,
        width: '60%', // Adjust width for summary
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    // Signatures
    signatureSection: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    signatureBlock: {
        textAlign: 'center',
        width: '35%',
    },
    signatureName: {
        marginTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    bold: {
        fontWeight: 'bold',
    },
    textSmall: {
        fontSize: 9,
    }
});

interface LaporanPdfProps {
    data: LaporanKasResult;
    akunNama: string;
    signatories: {
        ketua: string;
        bendahara: string;
        kota: string;
        tanggal: string;
    };
}

export const LaporanPdf = ({ data, akunNama, signatories }: LaporanPdfProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text>GEREJA MASEHI INJILI DI TIMOR</Text>
                    <Text>JEMAAT ANUGERAH KOLUJU</Text>
                    <Text style={styles.headerTitle}>LAPORAN {akunNama.toUpperCase()}</Text>
                    <Text style={{ marginTop: 4 }}>PERIODE {data.periodeLabel.toUpperCase()}</Text>
                </View>

                {/* Info */}
                {/* <View style={styles.subHeader}>
                    <Text>Akun Kas: {akunNama}</Text>
                </View> */}

                {/* Table */}
                <View style={styles.table}>
                    {/* Header Row */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, styles.colTgl, styles.tableColHeader]}><Text>TGL/BLN</Text></View>
                        <View style={[styles.tableCol, styles.colUraian, styles.tableColHeader]}><Text>URAIAN</Text></View>
                        <View style={[styles.tableCol, styles.colNoBukti, styles.tableColHeader]}><Text>NO KWT</Text></View>
                        <View style={[styles.tableCol, styles.colNominal, styles.tableColHeader]}><Text>PENERIMAAN (RP)</Text></View>
                        <View style={[styles.tableCol, styles.colNominal, styles.tableColHeader]}><Text>PENGELUARAN (RP)</Text></View>
                        <View style={[styles.tableCol, styles.colSaldo, styles.tableColHeader]}><Text>SALDO (RP)</Text></View>
                    </View>

                    {/* Saldo Awal */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, styles.colTgl]}><Text>-</Text></View>
                        <View style={[styles.tableCol, styles.colUraian]}><Text style={{ fontStyle: 'italic' }}>Saldo Periode Lalu</Text></View>
                        <View style={[styles.tableCol, styles.colNoBukti]}><Text></Text></View>
                        <View style={[styles.tableCol, styles.colNominal]}><Text></Text></View>
                        <View style={[styles.tableCol, styles.colNominal]}><Text></Text></View>
                        <View style={[styles.tableCol, styles.colSaldo]}><Text>{formatCurrency(data.saldoAwal).replace("Rp", "").trim()}</Text></View>
                    </View>

                    {/* Data Rows */}
                    {data.items.map((item) => (
                        <View style={styles.tableRow} key={item.id}>
                            <View style={[styles.tableCol, styles.colTgl]}>
                                <Text style={styles.textSmall}>{new Date(item.tanggal).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}</Text>
                            </View>
                            <View style={[styles.tableCol, styles.colUraian]}>
                                <Text style={styles.textSmall}>{item.uraian}</Text>
                            </View>
                            <View style={[styles.tableCol, styles.colNoBukti]}>
                                <Text style={styles.textSmall}>{item.noBukti || ""}</Text>
                            </View>
                            <View style={[styles.tableCol, styles.colNominal]}>
                                <Text style={styles.textSmall}>{item.debet > 0 ? formatCurrency(item.debet).replace("Rp", "").trim() : ""}</Text>
                            </View>
                            <View style={[styles.tableCol, styles.colNominal]}>
                                <Text style={styles.textSmall}>{item.kredit > 0 ? formatCurrency(item.kredit).replace("Rp", "").trim() : ""}</Text>
                            </View>
                            <View style={[styles.tableCol, styles.colSaldo]}>
                                <Text style={styles.textSmall}>{formatCurrency(item.saldoBerjalan).replace("Rp", "").trim()}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Total Row */}
                    <View style={[styles.tableRow, { backgroundColor: '#f9fafb' }]}>
                        <View style={[styles.tableCol, styles.colTgl, { borderRightWidth: 0 }]}><Text></Text></View>
                        <View style={[styles.tableCol, styles.colUraian, { borderRightWidth: 0 }]}><Text style={styles.bold}>JUMLAH</Text></View>
                        <View style={[styles.tableCol, styles.colNoBukti]}><Text></Text></View>
                        <View style={[styles.tableCol, styles.colNominal]}><Text style={styles.bold}>{formatCurrency(data.totalDebet).replace("Rp", "").trim()}</Text></View>
                        <View style={[styles.tableCol, styles.colNominal]}><Text style={styles.bold}>{formatCurrency(data.totalKredit).replace("Rp", "").trim()}</Text></View>
                        <View style={[styles.tableCol, styles.colSaldo]}><Text style={styles.bold}>{formatCurrency(data.saldoAkhir).replace("Rp", "").trim()}</Text></View>
                    </View>
                </View>

                {/* Footer Summary */}
                <View style={styles.footerSection}>
                    <Text style={{ marginBottom: 4 }}>Pada hari ini {signatories.tanggal} Buku kas {akunNama} ini ditutup dengan rincian sbb:</Text>
                    <View style={styles.summaryTable}>
                        <View style={styles.summaryRow}>
                            <Text>a. Saldo Periode Lalu</Text>
                            <Text>Rp. {formatCurrency(data.saldoAwal).replace("Rp", "").trim()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text>b. Penerimaan Periode ini</Text>
                            <Text>Rp. {formatCurrency(data.totalDebet).replace("Rp", "").trim()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text>c. Pengeluaran Periode ini</Text>
                            <Text>Rp. {formatCurrency(data.totalKredit).replace("Rp", "").trim()}</Text>
                        </View>
                        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#000', paddingTop: 2 }]}>
                            <Text style={styles.bold}>d. Saldo Kas Periode ini</Text>
                            <Text style={styles.bold}>Rp. {formatCurrency(data.saldoAkhir).replace("Rp", "").trim()}</Text>
                        </View>
                    </View>
                </View>

                {/* Signatures */}
                <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 40 }}>
                    <Text>{signatories.kota}, {signatories.tanggal}</Text>
                </View>
                <View style={{ textAlign: 'center', marginTop: 5 }}><Text>MAJELIS JEMAAT ANUGERAH KOLUJU</Text></View>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureBlock}>
                        <Text>Ketua,</Text>
                        <Text style={styles.signatureName}>{signatories.ketua}</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text>Bendahara I,</Text>
                        <Text style={styles.signatureName}>{signatories.bendahara}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
