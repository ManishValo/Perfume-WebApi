using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApplication1.Models;

namespace WebApplication1.ApiControllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/bill")]
    public class BillController : ApiController
    {
        DiorDBEntities1 db = new DiorDBEntities1();

        // GET: api/bill
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAllBills()
        {
            var bills = db.Bills
                .Select(b => new
                {
                    b.BillID,
                    b.UserID,
                    CustomerName = b.UserDetail.UserName,
                    b.BillDate,
                    b.BillAmt
                })
                .ToList();

            return Ok(bills);
        }

        // GET: api/bill/{billId}
        [HttpGet]
        [Route("{billId:int}")]
        public IHttpActionResult GetBillById(int billId)
        {
            var bill = db.Bills.Find(billId);
            if (bill == null)
                return NotFound();

            return Ok(bill);
        }

        // GET: api/bill/customer/{customerId}
        [HttpGet]
        [Route("customer/{customerId:int}")]
        public IHttpActionResult GetBillsByCustomer(int customerId)
        {
            var bills = db.Bills
                .Where(b => b.UserID == customerId)
                .Select(b => new
                {
                    b.BillID,
                    b.UserID,
                    CustomerName = b.UserDetail.UserName,
                    b.BillDate,
                    b.BillAmt
                })
                .ToList();

            return Ok(bills);
        }

        // GET: api/bill/details/{billId}
        [HttpGet]
        [Route("details/{billId:int}")]
        public IHttpActionResult GetBillDetails(int billId)
        {
            var details = db.BillDetails
                .Where(d => d.BillID == billId)
                .Select(d => new
                {
                    d.BillDetailsID,
                    d.BillID,
                    d.PerfumeID,
                    PerfumeName = d.Perfume != null ? d.Perfume.PerfumeName : "Unknown",
                    d.Quantity,
                    d.UnitPrice,
                    d.TotalPrice
                })
                .ToList();

            return Ok(details); // Always return 200 with empty array if no details
        }

        // POST: api/bill/add
        [HttpPost]
        [Route("add")]
        public IHttpActionResult AddBill(BillDTO billDto)
        {
            if (billDto == null || billDto.Details == null || !billDto.Details.Any())
                return BadRequest("Invalid bill data.");

            var bill = new Bill
            {
                UserID = billDto.UserID,
                BillAmt = billDto.BillAmt,
                BillDate = DateTime.Now
            };

            db.Bills.Add(bill);
            db.SaveChanges();

            foreach (var item in billDto.Details)
            {
                var detail = new BillDetail
                {
                    BillID = bill.BillID,
                    PerfumeID = item.PerfumeID,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice
                };
                db.BillDetails.Add(detail);
            }

            db.SaveChanges();

            return Ok(new { BillID = bill.BillID });
        }
    }
}
