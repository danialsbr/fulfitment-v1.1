from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime
from khayyam import JalaliDatetime
import os
import time

app = Flask(__name__)
CORS(app)

# In-memory database (replace with your existing orders_db)
orders_db = {}

@app.route('/api/system/status', methods=['GET'])
def get_system_status():
    return jsonify({
        'status': 'operational',
        'timestamp': JalaliDatetime.now().strftime("%Y/%m/%d %H:%M:%S"),
        'version': '1.0.0'
    })

@app.route('/api/system/ping', methods=['GET'])
def ping():
    return jsonify({
        'status': 'ok',
        'timestamp': int(time.time() * 1000)
    })

@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders_list = []
    for order_id, order_data in orders_db.items():
        for sku, details in order_data['SKUs'].items():
            orders_list.append({
                'id': order_id,
                'sku': sku,
                'title': details['Title'],
                'color': details['Color'],
                'quantity': details['Quantity'],
                'scanned': details['Scanned'],
                'status': 'Fulfilled' if details['Scanned'] >= details['Quantity'] else 'Pending',
                'price': details['Price'],
                'scanTimestamp': details.get('ScanTimestamp')
            })
    return jsonify(orders_list)

@app.route('/api/scan', methods=['POST'])
def scan_order():
    data = request.json
    order_id = data.get('orderId')
    sku = data.get('sku')
    
    if not order_id or not sku:
        return jsonify({'error': 'Missing required fields'}), 400
        
    if order_id not in orders_db or sku not in orders_db[order_id]['SKUs']:
        return jsonify({'error': 'Order or SKU not found'}), 404
        
    # Update scanned count
    orders_db[order_id]['SKUs'][sku]['Scanned'] += 1
    
    # Update scan timestamp
    current_time = JalaliDatetime.now()
    orders_db[order_id]['SKUs'][sku]['ScanTimestamp'] = current_time.strftime("%Y/%m/%d %H:%M")
    
    return jsonify({'message': 'Scan successful'})

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    if order_id not in orders_db:
        return jsonify({'error': 'Order not found'}), 404
        
    data = request.json
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'error': 'Missing status'}), 400
        
    orders_db[order_id]['Status'] = new_status
    return jsonify({'message': 'Status updated successfully'})

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order_details(order_id):
    if order_id not in orders_db:
        return jsonify({'error': 'Order not found'}), 404
    
    return jsonify(orders_db[order_id])

if __name__ == '__main__':
    app.run(debug=True, port=5000)