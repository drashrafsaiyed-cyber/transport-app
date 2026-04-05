import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { format } from 'date-fns'

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { tripDate: 'desc' },
      include: {
        party: { select: { partyName: true } },
        vehicle: { select: { vehicleNumber: true } },
        driver: { select: { name: true } },
      }
    })

    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Trips')

    ws.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Route/Place', key: 'place', width: 25 },
      { header: 'Party', key: 'party', width: 20 },
      { header: 'Vehicle', key: 'vehicle', width: 15 },
      { header: 'Driver', key: 'driver', width: 15 },
      { header: 'Start KM', key: 'startKm', width: 10 },
      { header: 'End KM', key: 'endKm', width: 10 },
      { header: 'Total KM', key: 'totalKm', width: 10 },
      { header: 'Rate/KM', key: 'rate', width: 10 },
      { header: 'Trip Amount', key: 'tripAmount', width: 14 },
      { header: 'Diesel', key: 'diesel', width: 12 },
      { header: 'Toll Tax', key: 'toll', width: 12 },
      { header: 'Border Tax', key: 'border', width: 12 },
      { header: 'Driver Wages', key: 'wages', width: 13 },
      { header: 'Misc', key: 'misc', width: 10 },
      { header: 'Final Bill', key: 'finalBill', width: 14 },
      { header: 'Paid Amount', key: 'paidAmount', width: 14 },
      { header: 'Pending', key: 'pending', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 20 },
    ]

    // Header styling
    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8C00' } }
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    trips.forEach(t => {
      ws.addRow({
        date: format(new Date(t.tripDate), 'dd/MM/yyyy'),
        place: t.place,
        party: t.party.partyName,
        vehicle: t.vehicle.vehicleNumber,
        driver: t.driver.name,
        startKm: t.startingKm,
        endKm: t.endingKm,
        totalKm: t.totalKm,
        rate: t.ratePerKm,
        tripAmount: t.tripAmount,
        diesel: t.dieselAmount,
        toll: t.tollTax,
        border: t.borderTax,
        wages: t.driverWages,
        misc: t.miscExpense,
        finalBill: t.finalBill,
        paidAmount: t.paidAmount,
        pending: t.finalBill - t.paidAmount,
        status: t.paymentStatus,
        remarks: t.remarks || '',
      })
    })

    // Add totals row
    const lastRow = ws.rowCount + 1
    ws.addRow({
      place: 'TOTAL',
      totalKm: trips.reduce((s, t) => s + t.totalKm, 0),
      tripAmount: trips.reduce((s, t) => s + t.tripAmount, 0),
      diesel: trips.reduce((s, t) => s + t.dieselAmount, 0),
      toll: trips.reduce((s, t) => s + t.tollTax, 0),
      border: trips.reduce((s, t) => s + t.borderTax, 0),
      wages: trips.reduce((s, t) => s + t.driverWages, 0),
      misc: trips.reduce((s, t) => s + t.miscExpense, 0),
      finalBill: trips.reduce((s, t) => s + t.finalBill, 0),
      paidAmount: trips.reduce((s, t) => s + t.paidAmount, 0),
      pending: trips.reduce((s, t) => s + (t.finalBill - t.paidAmount), 0),
    })
    ws.getRow(lastRow).font = { bold: true }

    const buffer = await workbook.xlsx.writeBuffer()
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="trips-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
