import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { format } from 'date-fns'

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { vehicleNumber: 'asc' },
      include: { _count: { select: { trips: true } } }
    })

    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Vehicles')

    ws.columns = [
      { header: 'Vehicle Number', key: 'number', width: 16 },
      { header: 'Type', key: 'type', width: 14 },
      { header: 'Owner', key: 'owner', width: 20 },
      { header: 'Monthly Tax', key: 'tax', width: 14 },
      { header: 'Insurance No.', key: 'insNo', width: 16 },
      { header: 'Insurance Expiry', key: 'insExpiry', width: 16 },
      { header: 'Fitness Expiry', key: 'fitness', width: 14 },
      { header: 'Pollution Expiry', key: 'pollution', width: 16 },
      { header: 'Permit', key: 'permit', width: 16 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Total Trips', key: 'trips', width: 12 },
    ]

    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8C00' } }

    vehicles.forEach(v => {
      ws.addRow({
        number: v.vehicleNumber,
        type: v.vehicleType.replace('_', ' '),
        owner: v.ownerName,
        tax: v.monthlyTax,
        insNo: v.insuranceNumber || '',
        insExpiry: v.insuranceExpiry ? format(new Date(v.insuranceExpiry), 'dd/MM/yyyy') : '',
        fitness: v.fitnessExpiry ? format(new Date(v.fitnessExpiry), 'dd/MM/yyyy') : '',
        pollution: v.pollutionExpiry ? format(new Date(v.pollutionExpiry), 'dd/MM/yyyy') : '',
        permit: v.permitDetails || '',
        status: v.isActive ? 'Active' : 'Inactive',
        trips: v._count.trips,
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="vehicles-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
