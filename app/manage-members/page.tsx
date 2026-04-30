import ManageMembersClient from '@/app/manage-members/ManageMembersClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "FamWallet-Manage Members"
}

export default function Login() {
    return (
        <div>
            <ManageMembersClient />
        </div>
    )
}