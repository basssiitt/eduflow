CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"city" text DEFAULT 'Karachi',
	"admin_email" text,
	"owner_name" text,
	"phone" varchar(30),
	"plan_tier" text DEFAULT 'pro' NOT NULL,
	"plan_status" text DEFAULT 'trial' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"trial_starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"trial_ends_at" timestamp with time zone NOT NULL,
	"first_paid_at" timestamp with time zone,
	"last_paid_at" timestamp with time zone,
	"next_billing_date" timestamp with time zone NOT NULL,
	"monthly_amount" numeric(12, 2) DEFAULT '5000.00' NOT NULL,
	"school_setup_complete" boolean DEFAULT false,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscription_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'PKR' NOT NULL,
	"billing_cycle" varchar(20) DEFAULT 'monthly' NOT NULL,
	"payment_method" varchar(30) DEFAULT 'bank_transfer' NOT NULL,
	"status" varchar(20) DEFAULT 'paid' NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"reference_no" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_student_id_students_id_fk";
--> statement-breakpoint
ALTER TABLE "fee_vouchers" DROP CONSTRAINT "fee_vouchers_student_id_students_id_fk";
--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_campus_id_campuses_id_fk";
--> statement-breakpoint
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_campus_id_campuses_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "student_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "fee_vouchers" ALTER COLUMN "student_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'school_admin';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "school_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "school_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "campuses" ADD COLUMN "school_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "fee_vouchers" ADD COLUMN "school_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "school_setup_complete" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "school_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "guardian_email" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "school_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "schools_slug_idx" ON "schools" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "schools_created_at_idx" ON "schools" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sub_payments_school_id_idx" ON "subscription_payments" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "sub_payments_paid_at_idx" ON "subscription_payments" USING btree ("paid_at");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_vouchers" ADD CONSTRAINT "fee_vouchers_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_vouchers" ADD CONSTRAINT "fee_vouchers_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendance_school_date_idx" ON "attendance" USING btree ("school_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_student_date_uq" ON "attendance" USING btree ("student_id","date");--> statement-breakpoint
CREATE INDEX "campuses_school_id_idx" ON "campuses" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "fee_vouchers_school_status_idx" ON "fee_vouchers" USING btree ("school_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "fee_vouchers_school_challan_uq" ON "fee_vouchers" USING btree ("school_id","challan_number");--> statement-breakpoint
CREATE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "profiles_school_id_idx" ON "profiles" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "students_school_id_idx" ON "students" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "students_parent_id_idx" ON "students" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_school_roll_uq" ON "students" USING btree ("school_id","roll_number");--> statement-breakpoint
CREATE INDEX "teachers_school_id_idx" ON "teachers" USING btree ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "teachers_school_emp_uq" ON "teachers" USING btree ("school_id","employee_code");