import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { format } from 'date-fns'

export async function GET() {
  try {
    const parties = await prisma.party.findMany({
      orderBy: { partyName: 'asc' },
      include: {
        trips: { select: { finalBill: true, paidAmount: true } }
      }
    })

    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Parties')

    ws.columns = [
      { header: 'Party Name', key: 'name', width: 25 },
      { header: 'Contact Person', key: 'contact', width: 20 },
      { header: 'Mobile', key: 'mobile', width: 14 },
      { header: 'GST Number', key: 'gst', width: 18 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Payment Terms', key: 'terms', width: 16 },
      { header: 'Total Trips', key: 'trips', width: 12 },
      { header: 'Total Bill', key: 'totalBill', width: 14 },
      { header: 'Total Paid', key: 'paid', width: 14 },
      { header: 'Outstanding', key: 'pending', width: 14 },
    ]

    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8C00' } }

    parties.forEach(p => {
      const totalBill = p.trips.reduce((s, t) => s + t.finalBill, 0)
      const totalPaid = p.trips.reduce((s, t) => s + t.paidAmount, 0)
      ws.addRow({
        name: p.partyName,
        contact: p.contactPerson || '',
        mobile: p.mobile || '',
        gst: p.gstNumber || '',
        address: p.address || '',
        terms: p.paymentTerms || '',
        trips: p.trips.length,
        totalBill,
        paid: totalPaid,
        pending: totalBill - totalPaid,
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="parties-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
