const Job = require('../models/Job');
const Invoice = require('../models/Invoice');

const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  // AUTO-SYNC: If details are updated here, cascade them to any linked Jobs and Invoices
  try {
    const linkedJobs = await Job.find({ 
      $or: [ { email: enquiry.email }, { phone: enquiry.phone } ] 
    });

    for (let job of linkedJobs) {
      job.name = enquiry.name;
      job.phone = enquiry.phone;
      job.email = enquiry.email;
      job.address = enquiry.address;
      await job.save();

      if (job.invoiceId) {
        await Invoice.findByIdAndUpdate(job.invoiceId, {
          customer: enquiry.name,
          customerPhone: enquiry.phone,
          customerEmail: enquiry.email
        });
      }
    }
  } catch (err) {
    console.log("Silent sync error:", err);
  }

  ok(res, enquiry);
});