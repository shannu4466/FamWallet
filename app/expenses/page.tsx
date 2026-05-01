import ExpenseClient from './ExpenseClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "FamWallet-Expenses"
}

export default function Expenses() {
    return (
        <div>
            <ExpenseClient />
        </div>
    )
}