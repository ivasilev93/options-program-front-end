import { useState } from 'react';
import { optionsProgram } from './admin-data-access';

export default function AdminFeature() {
    const { createMarket } = optionsProgram();
    const [formData, setFormData] = useState({
        name: '',
        fee: 50, // Default 0.5%
        ix: 1,
        priceFeed: '',
        volatility: 8000, // Default 20%
        mint: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? Number(value) : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await createMarket.mutateAsync({
                fee: formData.fee,
                name: formData.name,
                ix: formData.ix,
                priceFeed: formData.priceFeed,
                volatility: formData.volatility,
                mint: formData.mint
            });
            
            // Reset form on success
            setFormData({
                name: '',
                fee: 50,
                ix: formData.ix + 1, // Increment for next market
                priceFeed: '',
                volatility: 2000,
                mint: ''
            });
            
        } catch (err) {
            console.log('createMarket failed: ', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">        
        <div className="bg-white rounded-xl">
          <div className="bg-white px-6 py-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-sky-400 bg-clip-text text-transparent">
            Create New Market
            </h1>
            {/* <p className="text-lg text-gray-600 opacity-80 mt-2">
              Interact with on-chain markets featuring dynamic pricing and custom terms
            </p> */}
          </div>
  
          
          {/* <div className="p-4"> */}
          <div className="space-y-6">
          <div className="bg-white rounded-lg p-6  max-w-2xl mx-auto">            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Market Name</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. SOL Options Market"
                        className="input input-bordered w-full"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Protocol Fee (basis points)</span>
                            <span className="label-text-alt">{(formData.fee / 100).toFixed(2)}%</span>
                        </label>
                        <input
                            type="number"
                            name="fee"
                            value={formData.fee}
                            onChange={handleChange}
                            min="0"
                            max="1000"
                            step="1"
                            className="input input-bordered w-full"
                            required
                        />
                        <label className="label">
                            <span className="label-text-alt">1-1000 bps (0.01%-10%)</span>
                        </label>
                    </div>
                    
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Market ID</span>
                        </label>
                        <input
                            type="number"
                            name="ix"
                            value={formData.ix}
                            onChange={handleChange}
                            min="1"
                            step="1"
                            className="input input-bordered w-full"
                            required
                        />
                        <label className="label">
                            <span className="label-text-alt">Unique market identifier</span>
                        </label>
                    </div>
                </div>
                

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Asset mint</span>
                    </label>
                    <input
                        type="text"
                        name="mint"
                        value={formData.mint}
                        onChange={handleChange}
                        placeholder="e.g. So11111111111111111111111111111111111111112"
                        className="input input-bordered w-full"
                        required
                    />
                    <label className="label">
                        <span className="label-text-alt">Market pool asset </span>
                    </label>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Price Feed</span>
                    </label>
                    <input
                        type="text"
                        name="priceFeed"
                        value={formData.priceFeed}
                        onChange={handleChange}
                        placeholder="e.g. SOL/USD"
                        className="input input-bordered w-full"
                        required
                    />
                    <label className="label">
                        <span className="label-text-alt">Price feed identifier</span>
                    </label>
                </div>
                
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Volatility (basis points)</span>
                        <span className="label-text-alt">{(formData.volatility / 100).toFixed(2)}%</span>
                    </label>
                    <input
                        type="number"
                        name="volatility"
                        value={formData.volatility}
                        onChange={handleChange}
                        min="100"
                        max="10000"
                        step="100"
                        className="input input-bordered w-full"
                        required
                    />
                    <label className="label">
                        <span className="label-text-alt">100-10000 bps (1%-100%)</span>
                    </label>
                </div>
                
                <div className="form-control mt-6">
                    <button 
                        type="submit" 
                        className="btn btn-primary w-full text-lg"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Creating Market...
                            </>
                        ) : (
                            'Create Market'
                        )}
                    </button>
                </div>
            </form>
            
            {createMarket.isError && (
                <div className="alert alert-error mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Error creating market. Please try again.</span>
                </div>
            )}
            
            {createMarket.isSuccess && (
                <div className="alert alert-success mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Market created successfully!</span>
                </div>
            )}
        </div>
          </div>
        </div>
      </div>
    );
}