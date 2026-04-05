'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Printer, FileText } from 'lucide-react'
import { format } from 'date-fns'

// Local helpers — cannot pass functions as props from server to client components
function fmtDate(d: string | Date | null | undefined) {
  if (!d) return '-'
  try { return format(new Date(d), 'dd/MM/yyyy') } catch { return '-' }
}

function fmtCur(amount: number, symbol = '₹') {
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface Trip {
  id: string
  tripDate: string
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
  party: {
    partyName: string
    billingAddress: string | null
    gstNumber: string | null
    mobile: string | null
  }
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
}

export function InvoiceClient({
  trip, companyName, companyAddress, companyGst, invoiceFooter,
  currencySymbol, enableGst, cgstPct, sgstPct, igstPct,
  defaultGstType, invoiceNumber,
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

      {/* ── Screen controls (hidden when printing) ── */}
      <div className="print:hidden mb-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/trips/${trip.id}`}><ArrowLeft className="h-4 w-4 mr-1" />Back to Trip</Link>
          </Button>
          <h1 className="text-xl font-bold flex-1">Invoice</h1>
          <Button onClick={() => window.print()} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Printer className="h-4 w-4 mr-2" />Print / Save PDF
          </Button>
        </div>

        {enableGst ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 pb-3">
              <p className="text-sm font-medium text-blue-800 mb-3">Select GST option before printing:</p>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={() => setWithGst(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${!withGst
                    ? 'bg-white border-blue-600 text-blue-600 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  <FileText className="h-3.5 w-3.5 inline mr-1.5" />Without GST
                </button>
                <button
                  onClick={() => setWithGst(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${withGst
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  <FileText className="h-3.5 w-3.5 inline mr-1.5" />With GST
                </button>

                {withGst && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-700">Type:</span>
                    <button
                      onClick={() => setGstType('CGST_SGST')}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${gstType === 'CGST_SGST'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-600 hover:border-blue-300'}`}
                    >
                      CGST+SGST ({cgstPct}%+{sgstPct}%)
                    </button>
                    <button
                      onClick={() => setGstType('IGST')}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${gstType === 'IGST'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-600 hover:border-blue-300'}`}
                    >
                      IGST ({igstPct}%)
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                {withGst
                  ? `✓ With GST — Grand Total: ${fmtCur(grandTotal, currencySymbol)}`
                  : `✓ Without GST — Total: ${fmtCur(base, currencySymbol)}`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
            💡 GST is currently disabled. Enable it in <Link href="/settings" className="underline font-medium">Settings → GST Settings</Link> to generate tax invoices.
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          PRINTABLE INVOICE
          ══════════════════════════════════════════ */}
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
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">GSTIN:</span> {companyGst}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block bg-orange-50 border border-orange-200 rounded-lg px-5 py-3">
                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">
                  {withGst && enableGst ? 'TAX INVOICE' : 'INVOICE'}
                </p>
                <p className="text-lg font-bold text-orange-700 mt-0.5">{invoiceNumber}</p>
                <p className="text-xs text-gray-500 mt-1">Date: {fmtDate(trip.tripDate)}</p>
              </div>
              <div className="mt-2">
                <Badge className={
                  trip.paymentStatus === 'PAID'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : trip.paymentStatus === 'PARTIAL'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }>
                  {trip.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To + Trip Details */}
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6 border-b bg-gray-50/60">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Bill To</p>
            <p className="font-semibold text-gray-900 text-base">{trip.party.partyName}</p>
            {trip.party.billingAddress && (
              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{trip.party.billingAddress}</p>
            )}
            {trip.party.mobile && (
              <p className="text-sm text-gray-600 mt-1">📞 {trip.party.mobile}</p>
            )}
            {trip.party.gstNumber && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">GSTIN:</span> {trip.party.gstNumber}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Trip Details</p>
            <div className="space-y-1.5 text-sm">
              {[
                ['Route', trip.place],
                ['Vehicle No.', trip.vehicle.vehicleNumber],
                ['Driver', trip.driver.name],
                ['Trip Date', fmtDate(trip.tripDate)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-gray-400 w-28 shrink-0">{label}</span>
                  <span className="font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-6 md:p-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left pb-2 text-gray-400 font-medium w-8">#</th>
                <th className="text-left pb-2 text-gray-400 font-medium">Description</th>
                <th className="text-right pb-2 text-gray-400 font-medium w-20">KM</th>
                <th className="text-right pb-2 text-gray-400 font-medium w-28">Rate</th>
                <th className="text-right pb-2 text-gray-400 font-medium w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-400">01</td>
                <td className="py-3">
                  <p className="font-medium text-gray-900">Freight Charges — {trip.place}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    KM: {trip.startingKm.toFixed(0)} → {trip.endingKm.toFixed(0)} &nbsp;({trip.totalKm.toFixed(0)} km)
                  </p>
                </td>
                <td className="py-3 text-right text-gray-700">{trip.totalKm.toFixed(0)}</td>
                <td className="py-3 text-right text-gray-700">{fmtCur(trip.ratePerKm, currencySymbol)}/km</td>
                <td className="py-3 text-right font-semibold">{fmtCur(trip.tripAmount, currencySymbol)}</td>
              </tr>

              {trip.tollTax > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-300">02</td>
                  <td className="py-2 text-gray-600">Toll Charges</td>
                  <td className="py-2 text-right text-gray-400">—</td>
                  <td className="py-2 text-right text-gray-400">—</td>
                  <td className="py-2 text-right">{fmtCur(trip.tollTax, currencySymbol)}</td>
                </tr>
              )}
              {trip.borderTax > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-300">03</td>
                  <td className="py-2 text-gray-600">Border / State Entry Charges</td>
                  <td className="py-2 text-right text-gray-400">—</td>
                  <td className="py-2 text-right text-gray-400">—</td>
                  <td className="py-2 text-right">{fmtCur(trip.borderTax, currencySymbol)}</td>
                </tr>
              )}
              {trip.miscExpense > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-300">04</td>
                  <td className="py-2 text-gray-600">Miscellaneous Charges</td>
                  <td className="py-2 text-right text-gray-400">—</td>
                  <td className="py-2 text-right text-gray-400">—</td>
                  <td className="py-2 text-right">{fmtCur(trip.miscExpense, currencySymbol)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Block */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-1">
              <div className="flex justify-between text-sm py-1 text-gray-600">
                <span>Subtotal</span>
                <span>{fmtCur(base, currencySymbol)}</span>
              </div>

              {/* GST lines — only when withGst is true */}
              {withGst && enableGst && gstType === 'CGST_SGST' && (
                <>
                  <div className="flex justify-between text-sm py-1 text-blue-700">
                    <span>CGST @ {cgstPct}%</span>
                    <span>{fmtCur(cgstAmt, currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 text-blue-700">
                    <span>SGST @ {sgstPct}%</span>
                    <span>{fmtCur(sgstAmt, currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 text-blue-700 font-medium border-t border-blue-100 pt-2">
                    <span>Total GST</span>
                    <span>{fmtCur(totalGst, currencySymbol)}</span>
                  </div>
                </>
              )}
              {withGst && enableGst && gstType === 'IGST' && (
                <>
                  <div className="flex justify-between text-sm py-1 text-blue-700">
                    <span>IGST @ {igstPct}%</span>
                    <span>{fmtCur(igstAmt, currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 text-blue-700 font-medium border-t border-blue-100 pt-2">
                    <span>Total GST</span>
                    <span>{fmtCur(totalGst, currencySymbol)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between font-bold text-base py-2.5 border-t-2 border-gray-800 mt-2">
                <span>{withGst && enableGst ? 'Grand Total (incl. GST)' : 'Total Amount'}</span>
                <span className="text-orange-600">{fmtCur(grandTotal, currencySymbol)}</span>
              </div>

              {trip.paidAmount > 0 && (
                <div className="flex justify-between text-sm py-1 text-green-600">
                  <span>Amount Received</span>
                  <span>({fmtCur(trip.paidAmount, currencySymbol)})</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-semibold py-1.5 border-t">
                <span>Balance Due</span>
                <span className={Math.max(0, balanceDue) > 0 ? 'text-red-600' : 'text-green-600'}>
                  {fmtCur(Math.max(0, balanceDue), currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Accounting — shown on screen only, NOT printed */}
        <div className="mx-6 md:mx-8 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg print:hidden">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
            📊 Internal Accounting (Not Printed on Invoice)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white rounded p-2 border">
              <p className="text-gray-400 text-xs mb-0.5">Diesel</p>
              <p className="font-medium">{fmtCur(trip.dieselAmount, currencySymbol)}</p>
            </div>
            <div className="bg-white rounded p-2 border">
              <p className="text-gray-400 text-xs mb-0.5">Toll</p>
              <p className="font-medium">{fmtCur(trip.tollTax, currencySymbol)}</p>
            </div>
            <div className="bg-white rounded p-2 border">
              <p className="text-gray-400 text-xs mb-0.5">Driver Wages</p>
              <p className="font-medium">{fmtCur(trip.driverWages, currencySymbol)}</p>
            </div>
            <div className="bg-white rounded p-2 border">
              <p className="text-gray-400 text-xs mb-0.5">Border Tax</p>
              <p className="font-medium">{fmtCur(trip.borderTax, currencySymbol)}</p>
            </div>
            <div className="bg-white rounded p-2 border">
              <p className="text-gray-400 text-xs mb-0.5">Misc Expense</p>
              <p className="font-medium">{fmtCur(trip.miscExpense, currencySymbol)}</p>
            </div>
            <div className="bg-white rounded p-2 border border-red-100">
              <p className="text-gray-400 text-xs mb-0.5">Total Expenses</p>
              <p className="font-bold text-red-600">{fmtCur(totalExpenses, currencySymbol)}</p>
            </div>
            <div className="bg-white rounded p-2 border border-blue-100">
              <p className="text-gray-400 text-xs mb-0.5">Revenue (bill)</p>
              <p className="font-bold text-blue-600">{fmtCur(trip.finalBill, currencySymbol)}</p>
            </div>
            <div className="bg-white rounded p-2 border border-green-100">
              <p className="text-gray-400 text-xs mb-0.5">Net Profit</p>
              <p className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {fmtCur(profit, currencySymbol)}
              </p>
            </div>
          </div>
          {withGst && enableGst && (
            <div className="mt-3 pt-3 border-t border-amber-200 flex gap-6 text-sm">
              <div>
                <span className="text-gray-500">GST Collected: </span>
                <span className="font-semibold text-blue-700">{fmtCur(totalGst, currencySymbol)}</span>
              </div>
              <div>
                <span className="text-gray-500">Grand Total (with GST): </span>
                <span className="font-semibold text-orange-600">{fmtCur(grandTotal, currencySymbol)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Remarks */}
        {trip.remarks && (
          <div className="px-6 md:px-8 pb-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Remarks:</span> {trip.remarks}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 md:p-8 border-t bg-gray-50">
          <div className="flex justify-between items-end flex-wrap gap-6">
            <div className="text-sm text-gray-500 max-w-sm">
              <p>{invoiceFooter}</p>
              {withGst && enableGst && (
                <p className="text-xs text-gray-400 mt-1">
                  This is a computer-generated{' '}
                  {gstType === 'IGST' ? 'IGST' : 'CGST/SGST'} Tax Invoice as per GST Act.
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="h-14 border-b-2 border-gray-400 w-44 mb-1 mx-auto"></div>
              <p className="text-xs text-gray-500">Authorised Signatory</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{companyName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
