'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Printer, FileText } from 'lucide-react'

interface Trip {
  id: string
  tripDate: Date
  place: string
  ratePerKm: number
  startingKm: number
  endingKm: number
  totalKm: number
  dieselAmount: number
  tollTax: number
  borderTax: number
  driverWages: number
  miscExpense: number
  tripAmount: number
  finalBill: number
  paymentStatus: string
  paidAmount: number
  remarks: string | null
  party: { partyName: string; billingAddress: string | null; gstNumber: string | null; mobile: string | null }
  vehicle: { vehicleNumber: string; vehicleType: string }
  driver: { name: string; mobile: string }
}

interface Props {
  trip: Trip
  companyName: string
  companyAddress: string
  companyGst: string
  invoiceFooter: string
  currencySymbol: string
  enableGst: boolean
  cgstPct: number
  sgstPct: number
  igstPct: number
  defaultGstType: string
  invoiceNumber: string
  formatDate: (d: Date | string | null, fmt?: string) => string
  formatCurrency: (n: number, s?: string) => string
}

export function InvoiceClient({
  trip, companyName, companyAddress, companyGst, invoiceFooter,
  currencySymbol, enableGst, cgstPct, sgstPct, igstPct,
  defaultGstType, invoiceNumber, formatDate, formatCurrency
}: Props) {
  const [withGst, setWithGst] = useState(false)
  const [gstType, setGstType] = useState(defaultGstType)

  const base = trip.finalBill

  // GST Calculations
  const cgstAmt = withGst && gstType === 'CGST_SGST' ? (base * cgstPct) / 100 : 0
  const sgstAmt = withGst && gstType === 'CGST_SGST' ? (base * sgstPct) / 100 : 0
  const igstAmt = withGst && gstType === 'IGST' ? (base * igstPct) / 100 : 0
  const totalGst = cgstAmt + sgstAmt + igstAmt
  const grandTotal = base + totalGst
  const balanceDue = grandTotal - trip.paidAmount

  const totalExpenses = trip.dieselAmount + trip.tollTax + trip.borderTax + trip.driverWages + trip.miscExpense
  const profit = trip.finalBill - totalExpenses

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      {/* Controls - hidden on print */}
      <div className="print:hidden mb-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/trips/${trip.id}`}><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
          </Button>
          <h1 className="text-xl font-bold flex-1">Invoice</h1>
          <Button onClick={() => window.print()} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Printer className="h-4 w-4 mr-2" />Print / Save PDF
          </Button>
        </div>

        {enableGst && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 pb-3">
              <p className="text-sm font-medium text-blue-800 mb-3">GST Options — choose before printing:</p>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWithGst(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${!withGst ? 'bg-white border-blue-600 text-blue-600 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    <FileText className="h-3.5 w-3.5 inline mr-1.5" />Without GST
                  </button>
                  <button
                    onClick={() => setWithGst(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${withGst ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    <FileText className="h-3.5 w-3.5 inline mr-1.5" />With GST
                  </button>
                </div>
                {withGst && (
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm text-blue-700">Type:</span>
                    <button
                      onClick={() => setGstType('CGST_SGST')}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${gstType === 'CGST_SGST' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}
                    >
                      CGST+SGST ({cgstPct}%+{sgstPct}%)
                    </button>
                    <button
                      onClick={() => setGstType('IGST')}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${gstType === 'IGST' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}
                    >
                      IGST ({igstPct}%)
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {withGst
                  ? `✓ Invoice will include GST — Grand Total: ${formatCurrency(grandTotal, currencySymbol)}`
                  : `✓ Invoice without GST — Total: ${formatCurrency(base, currencySymbol)}`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ============================================================
          PRINTABLE INVOICE - everything below prints
          ============================================================ */}
      <div className="bg-white border rounded-lg shadow-sm print:shadow-none print:border-0 print:rounded-none">

        {/* Header */}
        <div className="p-6 md:p-8 border-b">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{companyName}</h2>
              {companyAddress && (
                <p className="text-sm text-gray-600 mt-1 max-w-xs whitespace-pre-line">{companyAddress}</p>
              )}
              {companyGst && (
                <p className="text-sm text-gray-600 mt-1"><span className="font-medium">GSTIN:</span> {companyGst}</p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block bg-orange-50 border border-orange-200 rounded-lg px-5 py-3">
                <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">
                  {withGst && enableGst ? 'TAX INVOICE' : 'INVOICE'}
                </p>
                <p className="text-lg font-bold text-orange-700 mt-0.5">{invoiceNumber}</p>
                <p className="text-xs text-gray-500 mt-1">Date: {formatDate(trip.tripDate)}</p>
              </div>
              <div className="mt-2">
                <Badge className={
                  trip.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' :
                  trip.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }>
                  {trip.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To & Trip Info */}
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6 border-b bg-gray-50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Bill To</p>
            <p className="font-semibold text-gray-900 text-base">{trip.party.partyName}</p>
            {trip.party.billingAddress && (
              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{trip.party.billingAddress}</p>
            )}
            {trip.party.mobile && (
              <p className="text-sm text-gray-600 mt-1">📞 {trip.party.mobile}</p>
            )}
            {trip.party.gstNumber && (
              <p className="text-sm text-gray-600 mt-1"><span className="font-medium">GSTIN:</span> {trip.party.gstNumber}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Trip Details</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex gap-2"><span className="text-gray-500 w-28">Route</span><span className="font-medium">{trip.place}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">Vehicle</span><span className="font-medium">{trip.vehicle.vehicleNumber}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">Driver</span><span className="font-medium">{trip.driver.name}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">Trip Date</span><span className="font-medium">{formatDate(trip.tripDate)}</span></div>
            </div>
          </div>
        </div>

        {/* Service Table */}
        <div className="p-6 md:p-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">#</th>
                <th className="text-left py-2 text-gray-500 font-medium">Description</th>
                <th className="text-right py-2 text-gray-500 font-medium">KM</th>
                <th className="text-right py-2 text-gray-500 font-medium">Rate</th>
                <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-500">01</td>
                <td className="py-3">
                  <p className="font-medium text-gray-900">Freight Charges — {trip.place}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    KM: {trip.startingKm.toFixed(0)} → {trip.endingKm.toFixed(0)} ({trip.totalKm.toFixed(0)} km)
                  </p>
                </td>
                <td className="py-3 text-right">{trip.totalKm.toFixed(0)}</td>
                <td className="py-3 text-right">{formatCurrency(trip.ratePerKm, currencySymbol)}/km</td>
                <td className="py-3 text-right font-medium">{formatCurrency(trip.tripAmount, currencySymbol)}</td>
              </tr>
              {trip.tollTax > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-400">02</td>
                  <td className="py-2 text-gray-700">Toll Charges</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right">{formatCurrency(trip.tollTax, currencySymbol)}</td>
                </tr>
              )}
              {trip.borderTax > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-400">03</td>
                  <td className="py-2 text-gray-700">Border Charges</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right">{formatCurrency(trip.borderTax, currencySymbol)}</td>
                </tr>
              )}
              {trip.miscExpense > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-400">04</td>
                  <td className="py-2 text-gray-700">Miscellaneous Charges</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right">{formatCurrency(trip.miscExpense, currencySymbol)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-sm space-y-1.5">
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(base, currencySymbol)}</span>
              </div>

              {/* GST breakdown — only shown when withGst is true */}
              {withGst && enableGst && gstType === 'CGST_SGST' && (
                <>
                  <div className="flex justify-between text-sm py-1 text-blue-700">
                    <span>CGST @ {cgstPct}%</span>
                    <span>{formatCurrency(cgstAmt, currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 text-blue-700">
                    <span>SGST @ {sgstPct}%</span>
                    <span>{formatCurrency(sgstAmt, currencySymbol)}</span>
                  </div>
                </>
              )}
              {withGst && enableGst && gstType === 'IGST' && (
                <div className="flex justify-between text-sm py-1 text-blue-700">
                  <span>IGST @ {igstPct}%</span>
                  <span>{formatCurrency(igstAmt, currencySymbol)}</span>
                </div>
              )}
              {withGst && enableGst && (
                <div className="flex justify-between text-sm py-1 text-blue-700 font-medium">
                  <span>Total GST</span>
                  <span>{formatCurrency(totalGst, currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-base py-2 border-t-2 border-gray-900 mt-1">
                <span>{withGst && enableGst ? 'Grand Total (incl. GST)' : 'Total Amount'}</span>
                <span className="text-orange-600">{formatCurrency(grandTotal, currencySymbol)}</span>
              </div>

              {trip.paidAmount > 0 && (
                <div className="flex justify-between text-sm py-1 text-green-600">
                  <span>Amount Paid</span>
                  <span>({formatCurrency(trip.paidAmount, currencySymbol)})</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-sm py-1.5 border-t">
                <span>Balance Due</span>
                <span className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(Math.max(0, balanceDue), currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Expense Summary — visible on screen, hidden on print for party copy */}
        <div className="mx-6 md:mx-8 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg print:hidden">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Internal Accounting (Not Printed)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><p className="text-gray-500 text-xs">Diesel</p><p className="font-medium">{formatCurrency(trip.dieselAmount, currencySymbol)}</p></div>
            <div><p className="text-gray-500 text-xs">Toll</p><p className="font-medium">{formatCurrency(trip.tollTax, currencySymbol)}</p></div>
            <div><p className="text-gray-500 text-xs">Driver Wages</p><p className="font-medium">{formatCurrency(trip.driverWages, currencySymbol)}</p></div>
            <div><p className="text-gray-500 text-xs">Total Expenses</p><p className="font-medium text-red-600">{formatCurrency(totalExpenses, currencySymbol)}</p></div>
            <div><p className="text-gray-500 text-xs">Trip Revenue</p><p className="font-medium text-blue-600">{formatCurrency(trip.finalBill, currencySymbol)}</p></div>
            <div><p className="text-gray-500 text-xs">GST Collected</p><p className="font-medium text-blue-600">{withGst && enableGst ? formatCurrency(totalGst, currencySymbol) : '—'}</p></div>
            <div><p className="text-gray-500 text-xs">Net Profit</p><p className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profit, currencySymbol)}</p></div>
          </div>
        </div>

        {/* Remarks */}
        {trip.remarks && (
          <div className="px-6 md:px-8 pb-4">
            <p className="text-sm text-gray-500"><span className="font-medium">Remarks:</span> {trip.remarks}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 md:p-8 border-t bg-gray-50">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-500">{invoiceFooter}</p>
              {withGst && enableGst && (
                <p className="text-xs text-gray-400 mt-1">
                  This is a computer-generated {gstType === 'IGST' ? 'IGST' : 'CGST/SGST'} Tax Invoice.
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="h-12 border-b border-gray-400 w-36 mb-1"></div>
              <p className="text-xs text-gray-500">Authorised Signatory</p>
              <p className="text-xs font-medium text-gray-700">{companyName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
