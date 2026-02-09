"""Warranty models."""
from io import BytesIO

from django.db import models
from django.utils import timezone
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model

import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from core.models import TimeStampedModel
from core.utils import generate_warranty_number, calculate_warranty_expiry
from apps.inventory.models import SerialNumber

User = get_user_model()


class Warranty(TimeStampedModel):
	"""Warranty record for a sold battery."""

	class Status(models.TextChoices):
		ACTIVE = 'ACTIVE', 'Active'
		EXPIRED = 'EXPIRED', 'Expired'
		VOID = 'VOID', 'Void'

	warranty_number = models.CharField(max_length=40, unique=True, db_index=True)
	serial_number = models.OneToOneField(
		SerialNumber,
		on_delete=models.CASCADE,
		related_name='warranty'
	)
	consumer = models.ForeignKey(
		User,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='warranties'
	)
	issued_by = models.ForeignKey(
		User,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='issued_warranties'
	)
	issued_at = models.DateTimeField(default=timezone.now)
	start_date = models.DateTimeField(default=timezone.now)
	end_date = models.DateTimeField(null=True, blank=True)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
	certificate_file = models.FileField(upload_to='warranties/certificates/', null=True, blank=True)
	qr_code_image = models.ImageField(upload_to='warranties/qr/', null=True, blank=True)
	notes = models.TextField(blank=True)

	class Meta:
		db_table = 'warranties'
		ordering = ['-created_at']

	def __str__(self):
		return self.warranty_number

	@property
	def battery_model(self):
		return self.serial_number.battery_model

	@property
	def is_expired(self):
		return bool(self.end_date and timezone.now() > self.end_date)

	def ensure_dates(self):
		"""Ensure start and end dates are set based on battery model warranty months."""
		if not self.start_date:
			self.start_date = timezone.now()
		if not self.end_date:
			months = self.serial_number.battery_model.warranty_months
			if months:
				self.end_date = calculate_warranty_expiry(self.start_date, months)

	def generate_assets(self, verify_url):
		"""Generate QR code and PDF certificate for the warranty."""
		qr_buffer = None
		if verify_url:
			qr = qrcode.QRCode(version=1, box_size=8, border=2)
			qr.add_data(verify_url)
			qr.make(fit=True)
			qr_image = qr.make_image(fill_color='black', back_color='white')

			qr_buffer = BytesIO()
			qr_image.save(qr_buffer, format='PNG')
			qr_filename = f'{self.warranty_number}_qr.png'
			self.qr_code_image.save(qr_filename, ContentFile(qr_buffer.getvalue()), save=False)

		pdf_buffer = BytesIO()
		pdf = canvas.Canvas(pdf_buffer, pagesize=A4)
		pdf.setTitle(f'Warranty Certificate - {self.warranty_number}')

		pdf.setFont('Helvetica-Bold', 16)
		pdf.drawString(50, 800, 'Warranty Certificate')
		pdf.setFont('Helvetica', 12)
		pdf.drawString(50, 770, f'Warranty Number: {self.warranty_number}')
		pdf.drawString(50, 750, f'Serial Number: {self.serial_number.serial_number}')
		pdf.drawString(50, 730, f'Battery Model: {self.battery_model.name}')
		pdf.drawString(50, 710, f'Start Date: {self.start_date.date()}')
		if self.end_date:
			pdf.drawString(50, 690, f'End Date: {self.end_date.date()}')

		if self.consumer:
			pdf.drawString(50, 660, f'Consumer: {self.consumer.get_full_name()}')
			if self.consumer.phone:
				pdf.drawString(50, 640, f'Phone: {self.consumer.phone}')
			if self.consumer.email:
				pdf.drawString(50, 620, f'Email: {self.consumer.email}')

		if qr_buffer:
			pdf.drawString(50, 590, 'Scan QR to verify warranty:')
			qr_buffer.seek(0)
			pdf.drawImage(ImageReader(qr_buffer), 50, 430, width=150, height=150)

		pdf.showPage()
		pdf.save()

		pdf_filename = f'{self.warranty_number}.pdf'
		self.certificate_file.save(pdf_filename, ContentFile(pdf_buffer.getvalue()), save=False)

	def save(self, *args, **kwargs):
		if not self.warranty_number:
			self.warranty_number = generate_warranty_number()
		self.ensure_dates()
		if self.is_expired and self.status == self.Status.ACTIVE:
			self.status = self.Status.EXPIRED
		super().save(*args, **kwargs)


class WarrantyClaim(TimeStampedModel):
	"""Warranty claim record (future workflow)."""

	class Status(models.TextChoices):
		PENDING = 'PENDING', 'Pending'
		APPROVED = 'APPROVED', 'Approved'
		REJECTED = 'REJECTED', 'Rejected'

	warranty = models.ForeignKey(Warranty, on_delete=models.CASCADE, related_name='claims')
	consumer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='warranty_claims')
	description = models.TextField(blank=True)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

	class Meta:
		db_table = 'warranty_claims'
		ordering = ['-created_at']

	def __str__(self):
		return f'Claim {self.id} ({self.status})'
