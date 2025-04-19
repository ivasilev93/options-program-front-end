import { getOptionsProgram, getOptionsProgramId } from '../../contract/options-program-exports'
import {
    Cluster,
  PublicKey,
} from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'

export function optionsProgram({ account }: { account: PublicKey }) {
    const { cluster } = useCluster()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getOptionsProgramId(cluster.network as Cluster), [cluster])
    const program = useMemo(() => getOptionsProgram(provider, programId), [provider, programId])

    const getUserAccount = useQuery({
        queryKey: [ 'userOptionsAccount', { cluster, account }],
        queryFn: async () => {

            const [userAcc] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("account"),
                  Buffer.from(account.toBuffer())
                ],
                program.programId
            );     

            const userAccData = await program.account.userAccount.fetch(userAcc);
            return userAccData;
        }
    })
  
      return {
        getUserAccount
      }
}
