import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { useVerifyPayment } from '../../hooks/useProfile';

export function PaymentSuccessPage() {
  const { search } = useLocation();
  const verifyMutation = useVerifyPayment();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const hasCalled = useRef(false);

  useEffect(() => {
    // Lock the effect so it only runs once and only while verifying
    if (status !== 'verifying' || hasCalled.current) return;

    const params = new URLSearchParams(search);
    const trxref = params.get('trxref');
    const tradeId = params.get('tradeId') || localStorage.getItem('emporia_pending_trade');

    if (trxref && tradeId) {
      hasCalled.current = true;
      
      const performVerification = async () => {
        try {
          console.log("Diagnostic - Initiating verification for:", { tradeId, trxref });
          const data = await verifyMutation.mutateAsync({ tradeId, trxref });
          console.log("Diagnostic - Server Response:", data);
          
          const isFunded = data.paymentStatus === 'ESCROW_FUNDED' || 
                          data.message?.toLowerCase().includes('funded') ||
                          data.message?.toLowerCase().includes('success');

          if (isFunded) {
            setStatus('success');
            localStorage.removeItem('emporia_pending_trade');
          } else {
            console.warn("Status Mismatch - Response received but not funded:", data);
            setStatus('error');
          }
        } catch (err) {
          console.error("Diagnostic - Verification Fatal Error:", err);
          setStatus('error');
        }
      };

      performVerification();
    } else if (trxref || tradeId) {
      console.error("Diagnostic - Missing parameters:", { trxref, tradeId });
      setStatus('error');
    }
  }, [search, status, verifyMutation]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <Loader2 className="absolute inset-0 w-full h-full text-red-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verifying Payment</h2>
            <p className="text-slate-500 font-medium">Securing your transaction with Emporia Protocol...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Successful</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Escrow account successfully funded. Your trade terms are now secured by the network.
            </p>
            <div className="pt-8">
              <button 
                onClick={() => window.close()}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-200"
              >
                <X className="w-4 h-4" /> Close This Window
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verification Failed</h2>
            <p className="text-slate-500 font-medium">
              We couldn't confirm your payment reference. If funds were debited, they will be auto-resolved within 24 hours.
            </p>
            <div className="pt-8">
              <button 
                onClick={() => window.close()}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
