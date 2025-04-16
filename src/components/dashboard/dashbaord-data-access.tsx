import { getOptionsProgram, getOptionsProgramId } from '../../contract/options-program-exports'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
    Cluster,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTransactionToast } from '../ui/ui-layout'

import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'

export function optionsProgram() {
    const { connection } = useConnection()
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getOptionsProgramId(cluster.network as Cluster), [cluster])
    const program = useMemo(() => getOptionsProgram(provider, programId), [provider, programId])

    const markets = useQuery({
        queryKey: ['markets', 'all', { cluster }],
        queryFn: () => program.account.market.all(),
    })

    const getProgramAccount = useQuery({
        queryKey: ['get-program-account', { cluster }],
        queryFn: () => connection.getParsedAccountInfo(programId),
    }) 

      return {
        program,
        programId,
        markets,
        getProgramAccount
      }
}