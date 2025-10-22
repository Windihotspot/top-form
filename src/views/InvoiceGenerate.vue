<template>
    <MainLayout>
          <v-container class="py-10 max-w-3xl mx-auto">
    <v-card class="pa-6 rounded shadow-lg">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">Invoice Generator</h2>

      <!-- Business Info -->
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="invoice.businessName"
            label="Your Business Name"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="invoice.businessEmail"
            label="Your Business Email"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>

      <!-- Client Info -->
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="invoice.clientName"
            label="Client Name"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="invoice.clientEmail"
            label="Client Email"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>

      <!-- Services -->
      <div class="mt-6">
        <h3 class="text-lg font-medium mb-2 text-gray-600">Services</h3>
        <div v-for="(item, index) in invoice.items" :key="index" class="flex gap-2 mb-3">
          <v-text-field
            v-model="item.description"
            label="Description"
            class="flex-1"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model.number="item.amount"
            label="Amount"
            type="number"
            class="w-32"
            variant="outlined"
            density="comfortable"
          />
          <v-btn size="small" icon color="red" @click="removeItem(index)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>

        <v-btn color="primary" variant="outlined" size="small" @click="addItem">
          <v-icon left>mdi-plus</v-icon>Add Service
        </v-btn>
      </div>

      <!-- Generate Button -->
      <div class="mt-8 text-center">
        <v-btn color="success" size="large" class="px-8 py-3" @click="generateInvoice">
          <v-icon left>mdi-file-pdf-box</v-icon>
          Generate Invoice
        </v-btn>
      </div>
    </v-card>
  </v-container>
    </MainLayout>

</template>

<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref } from 'vue'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.vfs

const invoice = ref({
  businessName: '',
  businessEmail: '',
  clientName: '',
  clientEmail: '',
  items: [{ description: '', amount: 0 }]
})

const addItem = () => invoice.value.items.push({ description: '', amount: 0 })
const removeItem = (index) => invoice.value.items.splice(index, 1)

const generateInvoice = () => {
  const total = invoice.value.items.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const docDefinition = {
    content: [
      { text: invoice.value.businessName || 'Business Name', style: 'header' },
      { text: invoice.value.businessEmail, style: 'subheader' },
      { text: 'INVOICE', style: 'invoiceTitle', margin: [0, 20, 0, 10] },

      {
        columns: [
          [
            { text: 'Bill To:', bold: true },
            { text: invoice.value.clientName },
            { text: invoice.value.clientEmail },
          ],
          [
            { text: `Date: ${new Date().toLocaleDateString()}`, alignment: 'right' },
            { text: `Invoice #: ${Math.floor(Math.random() * 100000)}`, alignment: 'right' }
          ]
        ],
      },

      { text: ' ', margin: [0, 10] },

      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            [{ text: 'Description', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }],
            ...invoice.value.items.map(item => [
              item.description || '-',
              { text: `$${item.amount.toFixed(2)}`, alignment: 'right' }
            ]),
            [
              { text: 'Total', bold: true },
              { text: `$${total.toFixed(2)}`, alignment: 'right', bold: true }
            ]
          ]
        }
      },

      { text: 'Thank you for your business!', style: 'thankYou', margin: [0, 30, 0, 0] }
    ],

    styles: {
      header: { fontSize: 20, bold: true, color: '#333' },
      subheader: { fontSize: 12, italics: true, color: '#666' },
      invoiceTitle: { fontSize: 18, bold: true, alignment: 'center', color: '#2e7d32' },
      tableHeader: { bold: true, fillColor: '#e0e0e0', color: '#333' },
      thankYou: { italics: true, alignment: 'center', color: '#4caf50' }
    },

    defaultStyle: {
      fontSize: 10
    }
  }

  pdfMake.createPdf(docDefinition).download(`Invoice_${invoice.value.clientName || 'Client'}.pdf`)
}
</script>

<style scoped>
.v-card {
  background-color: white;
}
.v-btn{
    text-transform: none;
}
</style>
