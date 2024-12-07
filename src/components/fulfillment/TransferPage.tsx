import React, { useState } from 'react';
import { Truck, Package, CheckCircle, ScanLine } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fulfillmentApi } from '../../services/api';
import { ScannerInput } from './ScannerInput';
import { TransferType } from '../../types';

const transferOptions: { id: TransferType; label: string; icon: React.ElementType }[] = [
  { id: 'پست', label: 'پست', icon: Truck },
  { id: 'اسنپ باکس', label: 'اسنپ باکس', icon: Package },
  { id: 'ماهکس', label: 'ماهکس', icon: Truck },
];

export function TransferPage() {
  const [orderId, setOrderId] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<TransferType | ''>('');
  const queryClient = useQueryClient();

  const { data: orderDetails, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderId ? fulfillmentApi.orders.getById(orderId) : null,
    enabled: !!orderId,
  });

  const transferMutation = useMutation({
    mutationFn: ({ orderId, transferType }: { orderId: string; transferType: TransferType }) =>
      fulfillmentApi.transfer.update(orderId, transferType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOrderId('');
      setSelectedTransfer('');
    },
  });

  const handleOrderSubmit = () => {
    if (orderId) {
      // Order ID scanned, validate and show order details
      console.log('Order ID scanned:', orderId);
    }
  };

  const handleTransfer = () => {
    if (orderId && selectedTransfer) {
      transferMutation.mutate({
        orderId,
        transferType: selectedTransfer,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="h-6 w-6 text-blue-500" />
          <h2 className="text-lg font-semibold">ثبت حمل و نقل</h2>
        </div>

        <div className="space-y-6">
          {/* Transfer Type Selection - Show First */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              انتخاب نوع حمل و نقل
            </label>
            <div className="grid grid-cols-3 gap-4">
              {transferOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedTransfer(option.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                      selectedTransfer === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <Icon className="h-6 w-6 text-blue-500" />
                    <span className="text-sm">{option.label}</span>
                    {selectedTransfer === option.id && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scanner Input for Order ID */}
          {selectedTransfer && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <ScannerInput
                value={orderId}
                onChange={setOrderId}
                onSubmit={handleOrderSubmit}
                label="اسکن شماره سفارش"
                icon={<ScanLine className="h-5 w-5 text-gray-400" />}
                autoFocus
              />
            </div>
          )}

          {/* Order Details (if found) */}
          {orderLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : orderDetails ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">جزئیات سفارش</h3>
              <div className="mt-2 text-sm text-blue-800">
                <p>شماره سفارش: {orderDetails.id}</p>
                <p>وضعیت: {orderDetails.status}</p>
              </div>
            </div>
          ) : orderId ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-800">
              سفارش مورد نظر یافت نشد
            </div>
          ) : null}

          {/* Submit Button */}
          {orderDetails?.status === 'Fulfilled' && selectedTransfer && (
            <>
              <button
                onClick={handleTransfer}
                disabled={!selectedTransfer || transferMutation.isPending}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {transferMutation.isPending ? 'در حال ثبت...' : 'ثبت حمل و نقل'}
              </button>

              {transferMutation.isSuccess && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span>حمل و نقل با موفقیت ثبت شد</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}