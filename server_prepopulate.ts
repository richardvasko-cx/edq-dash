import fs from "fs";
import path from "path";

const ALL_DOC_PATHS = [
  "docs/User Guide/administer/global/admin_settings/contact_information/index.md",
  "docs/User Guide/administer/global/admin_settings/index.md",
  "docs/User Guide/administer/global/admin_settings/notification_preferences/index.md",
  "docs/User Guide/administer/global/admin_settings/security_settings/index.md",
  "docs/User Guide/administer/global/admin_settings/security_settings/security_export_s3/index.md",
  "docs/User Guide/administer/global/admin_settings/workspace_time_zone/index.md",
  "docs/User Guide/administer/global/billing/credits_usage/index.md",
  "docs/User Guide/administer/global/billing/index.md",
  "docs/User Guide/administer/global/create_and_manage_workspaces/index.md",
  "docs/User Guide/administer/global/index.md",
  "docs/User Guide/administer/global/privacy/index.md",
  "docs/User Guide/administer/global/privacy/managing_consent/index.md",
  "docs/User Guide/administer/global/privacy/spam_regulations/index.md",
  "docs/User Guide/administer/global/saml_single_sign_on/index.md",
  "docs/User Guide/administer/global/saml_single_sign_on/microsoft_entra_sso/index.md",
  "docs/User Guide/administer/global/saml_single_sign_on/okta/index.md",
  "docs/User Guide/administer/global/saml_single_sign_on/onelogin/index.md",
  "docs/User Guide/administer/global/saml_single_sign_on/saml_just_in_time_provisioning/index.md",
  "docs/User Guide/administer/global/saml_single_sign_on/saml_sso_setup/index.md",
  "docs/User Guide/administer/global/user_management/automated_user_provisioning/index.md",
  "docs/User Guide/administer/global/user_management/index.md",
  "docs/User Guide/administer/global/user_management/internal_groups/index.md",
  "docs/User Guide/administer/global/user_management/manage_company_users/index.md",
  "docs/User Guide/administer/global/user_management/permissions/index.md",
  "docs/User Guide/administer/global/user_management/teams/index.md",
  "docs/User Guide/administer/global/workspace_settings/apis_and_identifiers/index.md",
  "docs/User Guide/administer/global/workspace_settings/brand_guidelines/index.md",
  "docs/User Guide/administer/global/workspace_settings/email_preferences/bot_filtering/index.md",
  "docs/User Guide/administer/global/workspace_settings/email_preferences/index.md",
  "docs/User Guide/administer/global/workspace_settings/index.md",
  "docs/User Guide/administer/global/workspace_settings/logs_and_alerts/api_usage_alerts/index.md",
  "docs/User Guide/administer/global/workspace_settings/logs_and_alerts/event_user_log/index.md",
  "docs/User Guide/administer/global/workspace_settings/logs_and_alerts/exports_log/index.md",
  "docs/User Guide/administer/global/workspace_settings/logs_and_alerts/message_activity_log/index.md",
  "docs/User Guide/administer/global/workspace_settings/messaging_rate_limits/index.md",
  "docs/User Guide/administer/global/workspace_settings/multi_language_settings/index.md",
  "docs/User Guide/administer/global/workspace_settings/push_settings/index.md",
  "docs/User Guide/administer/global/workspace_settings/tags/index.md",
  "docs/User Guide/administer/index.md",
  "docs/User Guide/administer/personal/accessing_your_account/index.md",
  "docs/User Guide/administer/personal/braze_certification/index.md",
  "docs/User Guide/administer/personal/braze_support/index.md",
  "docs/User Guide/administer/personal/index.md",
  "docs/User Guide/administer/personal/language_settings/index.md",
  "docs/User Guide/administer/personal/product_portal/index.md",
  "docs/User Guide/administer/personal/sdk_endpoints/index.md",
  "docs/User Guide/administer/personal/the_braze_dashboard/index.md",
  "docs/User Guide/analytics/dashboards/api_usage/index.md",
  "docs/User Guide/analytics/dashboards/channel_performance/index.md",
  "docs/User Guide/analytics/dashboards/conversions/index.md",
  "docs/User Guide/analytics/dashboards/dashboard_builder/diagnostics_dashboard/index.md",
  "docs/User Guide/analytics/dashboards/dashboard_builder/ecommerce_revenue_dashboard/index.md",
  "docs/User Guide/analytics/dashboards/dashboard_builder/index.md",
  "docs/User Guide/analytics/dashboards/deliverability_center/index.md",
  "docs/User Guide/analytics/dashboards/home/index.md",
  "docs/User Guide/analytics/dashboards/index.md",
  "docs/User Guide/analytics/index.md",
  "docs/User Guide/analytics/metrics_glossary/index.md",
  "docs/User Guide/analytics/reports/configure_reporting/index.md",
  "docs/User Guide/analytics/reports/custom_events_report/index.md",
  "docs/User Guide/analytics/reports/engagement_reports/index.md",
  "docs/User Guide/analytics/reports/funnel_reports/index.md",
  "docs/User Guide/analytics/reports/index.md",
  "docs/User Guide/analytics/reports/query_builder/building_queries/index.md",
  "docs/User Guide/analytics/reports/query_builder/data_by_segments/index.md",
  "docs/User Guide/analytics/reports/query_builder/index.md",
  "docs/User Guide/analytics/reports/query_builder/query_templates/index.md",
  "docs/User Guide/analytics/reports/query_builder/sql_variables/index.md",
  "docs/User Guide/analytics/reports/report_builder/index.md",
  "docs/User Guide/analytics/reports/report_builder/report_builder_legacy/index.md",
  "docs/User Guide/analytics/reports/retention_reports/index.md",
  "docs/User Guide/analytics/reports/revenue_report/index.md",
  "docs/User Guide/analytics/tracking/influenced_opens/index.md",
  "docs/User Guide/analytics/tracking/segment_analytics_tracking/index.md",
  "docs/User Guide/analytics/tracking/uninstall_tracking/index.md",
  "docs/User Guide/audience/global_control_group/index.md",
  "docs/User Guide/audience/index.md",
  "docs/User Guide/audience/locations_and_geofences/creating_geofences/index.md",
  "docs/User Guide/audience/locations_and_geofences/index.md",
  "docs/User Guide/audience/locations_and_geofences/location_tracking/index.md",
  "docs/User Guide/audience/manage_audience/import_users/csv_import/index.md",
  "docs/User Guide/audience/manage_audience/import_users/index.md",
  "docs/User Guide/audience/manage_audience/merge_duplicate_users/index.md",
  "docs/User Guide/audience/manage_audience/merge_duplicate_users/merge_behavior/index.md",
  "docs/User Guide/audience/manage_audience/user_profiles/delete_users/index.md",
  "docs/User Guide/audience/manage_audience/user_profiles/index.md",
  "docs/User Guide/audience/segments/creating_a_segment/index.md",
  "docs/User Guide/audience/segments/index.md",
  "docs/User Guide/audience/segments/location_targeting/index.md",
  "docs/User Guide/audience/segments/managing_segments/index.md",
  "docs/User Guide/audience/segments/measuring_segment_size/index.md",
  "docs/User Guide/audience/segments/regex/index.md",
  "docs/User Guide/audience/segments/segment_data/index.md",
  "docs/User Guide/audience/segments/segment_extension/cdi_segments/index.md",
  "docs/User Guide/audience/segments/segment_extension/index.md",
  "docs/User Guide/audience/segments/segment_extension/sql_segments/catalog_segments/index.md",
  "docs/User Guide/audience/segments/segment_extension/sql_segments/index.md",
  "docs/User Guide/audience/segments/segment_extension/sql_segments/rfm_segments/index.md",
  "docs/User Guide/audience/segments/segment_extension/sql_segments/sql_segments_tables/index.md",
  "docs/User Guide/audience/segments/segment_extension/sql_segments/use_cases/index.md",
  "docs/User Guide/audience/segments/segment_insights/index.md",
  "docs/User Guide/audience/segments/segment_with_nested_custom_attributes/index.md",
  "docs/User Guide/audience/segments/troubleshooting/index.md",
  "docs/User Guide/audience/subscription_preferences/index.md",
  "docs/User Guide/audience/subscription_preferences/preference_center/api_preference_center/index.md",
  "docs/User Guide/audience/subscription_preferences/preference_center/dnd_preference_center/index.md",
  "docs/User Guide/audience/subscription_preferences/preference_center/index.md",
  "docs/User Guide/audience/suppression_lists/index.md",
  "docs/User Guide/audience/your_audience/index.md",
  "docs/User Guide/brazeai/agents/creating_agents/index.md",
  "docs/User Guide/brazeai/agents/deploying_agents/index.md",
  "docs/User Guide/brazeai/agents/faq/index.md",
  "docs/User Guide/brazeai/agents/index.md",
  "docs/User Guide/brazeai/agents/reference/index.md",
  "docs/User Guide/brazeai/agents/use_cases/index.md",
  "docs/User Guide/brazeai/content_optimizer/index.md",
  "docs/User Guide/brazeai/decisioning_studio/audience/index.md",
  "docs/User Guide/brazeai/decisioning_studio/decisioning_studio_go/connect_data_sources/index.md",
  "docs/User Guide/brazeai/decisioning_studio/decisioning_studio_go/design_your_agent/index.md",
  "docs/User Guide/brazeai/decisioning_studio/decisioning_studio_go/index.md",
  "docs/User Guide/brazeai/decisioning_studio/decisioning_studio_go/launch_your_agent/index.md",
  "docs/User Guide/brazeai/decisioning_studio/decisioning_studio_go/set_up_orchestration/index.md",
  "docs/User Guide/brazeai/decisioning_studio/design_agents/index.md",
  "docs/User Guide/brazeai/decisioning_studio/faq/index.md",
  "docs/User Guide/brazeai/decisioning_studio/get_started/index.md",
  "docs/User Guide/brazeai/decisioning_studio/index.md",
  "docs/User Guide/brazeai/decisioning_studio/launch_agents/index.md",
  "docs/User Guide/brazeai/decisioning_studio/orchestration_setup/index.md",
  "docs/User Guide/brazeai/decisioning_studio/prepare_data/backfill_best_practices/index.md",
  "docs/User Guide/brazeai/decisioning_studio/prepare_data/braze_external_id/index.md",
  "docs/User Guide/brazeai/decisioning_studio/prepare_data/choose_features/index.md",
  "docs/User Guide/brazeai/decisioning_studio/prepare_data/connect_data_sources/index.md",
  "docs/User Guide/brazeai/decisioning_studio/prepare_data/data_assets/index.md",
  "docs/User Guide/brazeai/decisioning_studio/prepare_data/data_principles/index.md",
  "docs/User Guide/brazeai/decisioning_studio/prepare_data/data_streams/index.md",
  "docs/User Guide/brazeai/decisioning_studio/reporting/diagnostics/index.md",
  "docs/User Guide/brazeai/decisioning_studio/reporting/index.md",
  "docs/User Guide/brazeai/decisioning_studio/reporting/insights/index.md",
  "docs/User Guide/brazeai/decisioning_studio/reporting/performance/index.md",
  "docs/User Guide/brazeai/decisioning_studio/reporting/timeline/index.md",
  "docs/User Guide/brazeai/decisioning_studio/use_case/index.md",
  "docs/User Guide/brazeai/generative_ai/brand_guidelines/index.md",
  "docs/User Guide/brazeai/generative_ai/content_qa/index.md",
  "docs/User Guide/brazeai/generative_ai/copywriting/index.md",
  "docs/User Guide/brazeai/generative_ai/images/index.md",
  "docs/User Guide/brazeai/generative_ai/liquid/index.md",
  "docs/User Guide/brazeai/generative_ai/sql_queries/index.md",
  "docs/User Guide/brazeai/generative_ai/sql_segment_extensions/index.md",
  "docs/User Guide/brazeai/index.md",
  "docs/User Guide/brazeai/intelligence_suite/index.md",
  "docs/User Guide/brazeai/intelligence_suite/intelligent_channel/index.md",
  "docs/User Guide/brazeai/intelligence_suite/intelligent_selection/index.md",
  "docs/User Guide/brazeai/intelligence_suite/intelligent_timing/index.md",
  "docs/User Guide/brazeai/intelligence_suite/use_case/index.md",
  "docs/User Guide/brazeai/item_recommendations/creating_recommendations/ai/index.md",
  "docs/User Guide/brazeai/item_recommendations/creating_recommendations/rules_based/index.md",
  "docs/User Guide/brazeai/item_recommendations/index.md",
  "docs/User Guide/brazeai/item_recommendations/use_case/index.md",
  "docs/User Guide/brazeai/item_recommendations/using_recommendations/index.md",
  "docs/User Guide/brazeai/item_recommendations/viewing_analytics/index.md",
  "docs/User Guide/brazeai/mcp_server/available_api_functions/index.md",
  "docs/User Guide/brazeai/mcp_server/index.md",
  "docs/User Guide/brazeai/mcp_server/setup/index.md",
  "docs/User Guide/brazeai/mcp_server/usage/index.md",
  "docs/User Guide/brazeai/operator/index.md",
  "docs/User Guide/brazeai/operator/reviewing_actions/index.md",
  "docs/User Guide/brazeai/operator/support_tickets/index.md",
  "docs/User Guide/brazeai/operator/troubleshooting/index.md",
  "docs/User Guide/brazeai/predictive_suite/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_churn/analytics/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_churn/creating_a_churn_prediction/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_churn/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_churn/messaging_users/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_churn/troubleshooting/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_churn/use_case/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_events/analytics/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_events/creating_an_event_prediction/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_events/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_events/messaging_users/index.md",
  "docs/User Guide/brazeai/predictive_suite/predictive_events/use_case/index.md",
  "docs/User Guide/channels/banners/create_a_banner/index.md",
  "docs/User Guide/channels/banners/custom_code/index.md",
  "docs/User Guide/channels/banners/faq/index.md",
  "docs/User Guide/channels/banners/index.md",
  "docs/User Guide/channels/banners/reporting/index.md",
  "docs/User Guide/channels/content_cards/best_practices/improving_low_latency_requirements/index.md",
  "docs/User Guide/channels/content_cards/best_practices/index.md",
  "docs/User Guide/channels/content_cards/create_a_content_card/card_creation/index.md",
  "docs/User Guide/channels/content_cards/create_a_content_card/index.md",
  "docs/User Guide/channels/content_cards/creative_details/index.md",
  "docs/User Guide/channels/content_cards/index.md",
  "docs/User Guide/channels/content_cards/reporting/index.md",
  "docs/User Guide/channels/email/best_practices/apple_mail/email_private_relay_apple_SSO/index.md",
  "docs/User Guide/channels/email/best_practices/apple_mail/index.md",
  "docs/User Guide/channels/email/best_practices/apple_mail/mpp/index.md",
  "docs/User Guide/channels/email/best_practices/email_guidelines/index.md",
  "docs/User Guide/channels/email/best_practices/email_styling/index.md",
  "docs/User Guide/channels/email/best_practices/improve_deliverability/index.md",
  "docs/User Guide/channels/email/best_practices/sunset_policies/index.md",
  "docs/User Guide/channels/email/customize/amp_for_email/index.md",
  "docs/User Guide/channels/email/customize/custom_email_footer/index.md",
  "docs/User Guide/channels/email/customize/email_global_style_settings/index.md",
  "docs/User Guide/channels/email/customize/universal_links_and_app_links/index.md",
  "docs/User Guide/channels/email/drag_and_drop/faq/index.md",
  "docs/User Guide/channels/email/drag_and_drop/index.md",
  "docs/User Guide/channels/email/email_setup/authentication/index.md",
  "docs/User Guide/channels/email/email_setup/consent_and_address_collection/index.md",
  "docs/User Guide/channels/email/email_setup/deliverability_pitfalls_and_spam_traps/index.md",
  "docs/User Guide/channels/email/email_setup/email_validation/index.md",
  "docs/User Guide/channels/email/email_setup/import_your_email_list/index.md",
  "docs/User Guide/channels/email/email_setup/index.md",
  "docs/User Guide/channels/email/email_setup/ip_warming/automated_ip_warming/index.md",
  "docs/User Guide/channels/email/email_setup/ip_warming/index.md",
  "docs/User Guide/channels/email/email_setup/open_pixel_and_click_tracking/index.md",
  "docs/User Guide/channels/email/email_setup/setting_up_ips_and_domains/amazon_ses/index.md",
  "docs/User Guide/channels/email/email_setup/setting_up_ips_and_domains/index.md",
  "docs/User Guide/channels/email/email_setup/ssl/index.md",
  "docs/User Guide/channels/email/faq/index.md",
  "docs/User Guide/channels/email/html_editor/css_inline/index.md",
  "docs/User Guide/channels/email/html_editor/gmail_promotions_tab/index.md",
  "docs/User Guide/channels/email/html_editor/index.md",
  "docs/User Guide/channels/email/html_editor/troubleshooting/index.md",
  "docs/User Guide/channels/email/inbox_vision/index.md",
  "docs/User Guide/channels/email/index.md",
  "docs/User Guide/channels/email/reporting/analytics_glossary/index.md",
  "docs/User Guide/channels/email/reporting/index.md",
  "docs/User Guide/channels/email/subscriptions/index.md",
  "docs/User Guide/channels/email/use_cases/index.md",
  "docs/User Guide/channels/in_app_messages/best_practices/ios_app_rating_prompt/index.md",
  "docs/User Guide/channels/in_app_messages/best_practices/prep_guide/index.md",
  "docs/User Guide/channels/in_app_messages/customize/dark_mode_themes/index.md",
  "docs/User Guide/channels/in_app_messages/customize/index.md",
  "docs/User Guide/channels/in_app_messages/customize/style_settings/index.md",
  "docs/User Guide/channels/in_app_messages/customize/video_in_custom_html/index.md",
  "docs/User Guide/channels/in_app_messages/drag_and_drop/index.md",
  "docs/User Guide/channels/in_app_messages/faq/index.md",
  "docs/User Guide/channels/in_app_messages/index.md",
  "docs/User Guide/channels/in_app_messages/message_types/custom_html/index.md",
  "docs/User Guide/channels/in_app_messages/message_types/email_capture_form/index.md",
  "docs/User Guide/channels/in_app_messages/message_types/fullscreen/index.md",
  "docs/User Guide/channels/in_app_messages/message_types/modal/index.md",
  "docs/User Guide/channels/in_app_messages/message_types/simple_survey/index.md",
  "docs/User Guide/channels/in_app_messages/message_types/slideup/index.md",
  "docs/User Guide/channels/in_app_messages/reporting/index.md",
  "docs/User Guide/channels/in_app_messages/traditional/index.md",
  "docs/User Guide/channels/index.md",
  "docs/User Guide/channels/kakaotalk/create_kakaotalk_message/index.md",
  "docs/User Guide/channels/kakaotalk/kakaotalk_click_tracking/index.md",
  "docs/User Guide/channels/kakaotalk/kakaotalk_reporting/index.md",
  "docs/User Guide/channels/kakaotalk/kakaotalk_setup/index.md",
  "docs/User Guide/channels/line/create_a_line_message/index.md",
  "docs/User Guide/channels/line/create_a_line_message/line_click_tracking/index.md",
  "docs/User Guide/channels/line/create_a_line_message/message_types/index.md",
  "docs/User Guide/channels/line/index.md",
  "docs/User Guide/channels/line/line_setup/index.md",
  "docs/User Guide/channels/line/message_users/index.md",
  "docs/User Guide/channels/line/message_users/subscription_groups/index.md",
  "docs/User Guide/channels/line/message_users/user_management/index.md",
  "docs/User Guide/channels/line/reporting/index.md",
  "docs/User Guide/channels/push/best_practices/chinese_push_deliverability/index.md",
  "docs/User Guide/channels/push/best_practices/index.md",
  "docs/User Guide/channels/push/best_practices/push_primer_messages/index.md",
  "docs/User Guide/channels/push/create_a_push_message/index.md",
  "docs/User Guide/channels/push/create_a_push_message/message_and_image_formats/index.md",
  "docs/User Guide/channels/push/create_a_push_message/push_action_buttons/index.md",
  "docs/User Guide/channels/push/create_a_push_message/push_stories/index.md",
  "docs/User Guide/channels/push/create_a_push_message/quick_push_messages/index.md",
  "docs/User Guide/channels/push/faqs/index.md",
  "docs/User Guide/channels/push/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/android/advanced_campaign_settings/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/android/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/android/notification_channels/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/android/notification_options/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/android/push_max/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/android/rich_notifications/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/ios/custom_app_icon_feature_ios_103/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/ios/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/ios/notification_options/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/ios/rich_notifications/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/ios/utilizing_badge_count/index.md",
  "docs/User Guide/channels/push/platform_specific_resources/web/index.md",
  "docs/User Guide/channels/push/push_error_codes/index.md",
  "docs/User Guide/channels/push/push_setup/index.md",
  "docs/User Guide/channels/push/push_setup/push_subscription_states/index.md",
  "docs/User Guide/channels/push/push_setup/push_token_lifecycle/index.md",
  "docs/User Guide/channels/push/reporting/index.md",
  "docs/User Guide/channels/push/troubleshooting/index.md",
  "docs/User Guide/channels/push/types/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/billing_calculator/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/compliance_and_delivery/best_practices/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/compliance_and_delivery/collecting_user_opt_ins/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/compliance_and_delivery/laws_and_regulations/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/compliance_and_delivery/sms_traffic_pumping_fraud/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/create/contact_card/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/create/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/faqs/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/bot_click_filtering/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/custom_domains/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/double_opt_in/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/fuzzy_opt_out/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/keyword_handling/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/optin_optout/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/unknown_phone_numbers/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/link_shortening/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_features_and_optimization/user_retargeting/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_setup/rcs_setup/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_setup/sender_setup/10dlc/10dlc_application/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_setup/sender_setup/10dlc/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_setup/sender_setup/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_setup/sms_sending/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_setup/subscription_groups/geographic_permissions/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_setup/subscription_groups/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/message_setup/user_phone_numbers/index.md",
  "docs/User Guide/channels/sms_mms_and_rcs/reporting/index.md",
  "docs/User Guide/channels/transactional_email/create_a_transactional_email/index.md",
  "docs/User Guide/channels/transactional_email/index.md",
  "docs/User Guide/channels/transactional_email/tracking/index.md",
  "docs/User Guide/channels/webhooks/create_a_webhook/index.md",
  "docs/User Guide/channels/webhooks/index.md",
  "docs/User Guide/channels/webhooks/reporting/index.md",
  "docs/User Guide/channels/webhooks/use_case_create_a_braze_to_braze_webhook/index.md",
  "docs/User Guide/channels/whatsapp/best_practices/index.md",
  "docs/User Guide/channels/whatsapp/create_a_whatsapp_message/index.md",
  "docs/User Guide/channels/whatsapp/create_a_whatsapp_message/message_and_image_formats/index.md",
  "docs/User Guide/channels/whatsapp/faq/index.md",
  "docs/User Guide/channels/whatsapp/index.md",
  "docs/User Guide/channels/whatsapp/message_features_and_optimization/click_tracking/index.md",
  "docs/User Guide/channels/whatsapp/message_features_and_optimization/optimized_delivery/index.md",
  "docs/User Guide/channels/whatsapp/message_features_and_optimization/product_messages/index.md",
  "docs/User Guide/channels/whatsapp/message_features_and_optimization/template_builder/index.md",
  "docs/User Guide/channels/whatsapp/message_features_and_optimization/template_builder/whatsapp_carousel_templates/index.md",
  "docs/User Guide/channels/whatsapp/message_features_and_optimization/user_retargeting/index.md",
  "docs/User Guide/channels/whatsapp/message_features_and_optimization/whatsapp_flows/index.md",
  "docs/User Guide/channels/whatsapp/message_processing/handling_unknown_phone_numbers/index.md",
  "docs/User Guide/channels/whatsapp/message_processing/messaging_users/index.md",
  "docs/User Guide/channels/whatsapp/message_processing/opt_ins_and_opt_outs/index.md",
  "docs/User Guide/channels/whatsapp/message_processing/quality_rating_and_messaging_limits/index.md",
  "docs/User Guide/channels/whatsapp/meta_resources/index.md",
  "docs/User Guide/channels/whatsapp/reporting/index.md",
  "docs/User Guide/channels/whatsapp/use_cases/ads_that_click_to_whatsapp/index.md",
  "docs/User Guide/channels/whatsapp/use_cases/whatsapp_and_external_systems/index.md",
  "docs/User Guide/channels/whatsapp/whatsapp_setup/byo_connector/index.md",
  "docs/User Guide/channels/whatsapp/whatsapp_setup/embedded_signup/index.md",
  "docs/User Guide/channels/whatsapp/whatsapp_setup/index.md",
  "docs/User Guide/channels/whatsapp/whatsapp_setup/multiple_business_accounts/index.md",
  "docs/User Guide/channels/whatsapp/whatsapp_setup/subscription_groups/index.md",
  "docs/User Guide/channels/whatsapp/whatsapp_setup/user_phone_numbers/index.md",
  "docs/User Guide/channels/whatsapp/whatsapp_setup/whatsapp_phone_numbers/acquire_a_phone_number/index.md",
  "docs/User Guide/channels/whatsapp/whatsapp_setup/whatsapp_phone_numbers/migrate_a_phone_number/index.md",
  "docs/User Guide/channels/whatsapp/whatsapp_setup/whatsapp_phone_numbers/transfer_between_workspaces/index.md",
  "docs/User Guide/data/activation/attributes/array_of_objects/index.md",
  "docs/User Guide/data/activation/attributes/custom_attributes/index.md",
  "docs/User Guide/data/activation/attributes/index.md",
  "docs/User Guide/data/activation/attributes/nested_custom_attribute_support/index.md",
  "docs/User Guide/data/activation/attributes/standard_attributes/index.md",
  "docs/User Guide/data/activation/catalogs/catalog_triggers/back_in_stock_notifications/index.md",
  "docs/User Guide/data/activation/catalogs/catalog_triggers/price_drop_notifications/index.md",
  "docs/User Guide/data/activation/catalogs/create/index.md",
  "docs/User Guide/data/activation/catalogs/index.md",
  "docs/User Guide/data/activation/catalogs/selections/index.md",
  "docs/User Guide/data/activation/catalogs/use/index.md",
  "docs/User Guide/data/activation/custom_data/blocklist_custom_data/index.md",
  "docs/User Guide/data/activation/custom_data/data_types/index.md",
  "docs/User Guide/data/activation/custom_data/index.md",
  "docs/User Guide/data/activation/custom_data/managing_custom_data/index.md",
  "docs/User Guide/data/activation/events/custom_events/custom_event_properties/index.md",
  "docs/User Guide/data/activation/events/custom_events/index.md",
  "docs/User Guide/data/activation/events/custom_events/nested_objects/index.md",
  "docs/User Guide/data/activation/events/event_naming_conventions/index.md",
  "docs/User Guide/data/activation/events/index.md",
  "docs/User Guide/data/activation/events/purchase_events/index.md",
  "docs/User Guide/data/activation/events/recommended_events/ecommerce_events/index.md",
  "docs/User Guide/data/activation/events/recommended_events/index.md",
  "docs/User Guide/data/activation/index.md",
  "docs/User Guide/data/distribution/braze_currents/event_glossary/currents_changelogs/index.md",
  "docs/User Guide/data/distribution/braze_currents/event_glossary/customer_behavior_events/index.md",
  "docs/User Guide/data/distribution/braze_currents/event_glossary/message_engagement_events/index.md",
  "docs/User Guide/data/distribution/braze_currents/event_glossary/user_profiles_events/index.md",
  "docs/User Guide/data/distribution/braze_currents/faq/index.md",
  "docs/User Guide/data/distribution/braze_currents/index.md",
  "docs/User Guide/data/distribution/braze_currents/setting_up_currents/available_partners/index.md",
  "docs/User Guide/data/distribution/braze_currents/setting_up_currents/custom_http_connector/index.md",
  "docs/User Guide/data/distribution/braze_currents/setting_up_currents/event_delivery_semantics/index.md",
  "docs/User Guide/data/distribution/braze_currents/setting_up_currents/index.md",
  "docs/User Guide/data/distribution/braze_currents/use_cases/how_braze_uses_currents/index.md",
  "docs/User Guide/data/distribution/braze_currents/use_cases/index.md",
  "docs/User Guide/data/distribution/braze_currents/use_cases/s3_to_snowflake/index.md",
  "docs/User Guide/data/distribution/braze_currents/use_cases/transferring_data_to_redshift/index.md",
  "docs/User Guide/data/distribution/export_braze_data/export_apis/index.md",
  "docs/User Guide/data/distribution/export_braze_data/export_campaign_results_data/index.md",
  "docs/User Guide/data/distribution/export_braze_data/export_canvas_data/index.md",
  "docs/User Guide/data/distribution/export_braze_data/export_troubleshooting/index.md",
  "docs/User Guide/data/distribution/export_braze_data/faqs/index.md",
  "docs/User Guide/data/distribution/export_braze_data/index.md",
  "docs/User Guide/data/distribution/export_braze_data/message_archiving/index.md",
  "docs/User Guide/data/distribution/export_braze_data/segment_data_to_csv/index.md",
  "docs/User Guide/data/distribution/index.md",
  "docs/User Guide/data/index.md",
  "docs/User Guide/data/infrastructure/data_centers/index.md",
  "docs/User Guide/data/infrastructure/data_points/index.md",
  "docs/User Guide/data/infrastructure/field_level_encryption/index.md",
  "docs/User Guide/data/infrastructure/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/best_practices/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/connected_sources/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/delete_users/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/faqs/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/file_storage_integrations/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/integrations/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/sync_accounts_data/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/sync_catalogs_data/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/sync_logs/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/table_setup/index.md",
  "docs/User Guide/data/unification/cloud_ingestion/zero_copy_sync/index.md",
  "docs/User Guide/data/unification/creating_a_formula/index.md",
  "docs/User Guide/data/unification/data_transformation/creating_a_transformation/index.md",
  "docs/User Guide/data/unification/data_transformation/index.md",
  "docs/User Guide/data/unification/data_transformation/use_cases/index.md",
  "docs/User Guide/data/unification/index.md",
  "docs/User Guide/data/unification/user_data/best_practices/index.md",
  "docs/User Guide/data/unification/user_data/collection_use_case/index.md",
  "docs/User Guide/data/unification/user_data/index.md",
  "docs/User Guide/data/unification/user_data/language_codes/index.md",
  "docs/User Guide/data/unification/user_data/sdk_data_collection/index.md",
  "docs/User Guide/data/unification/user_data/user_profile_lifecycle/anonymous_users/index.md",
  "docs/User Guide/data/unification/user_data/user_profile_lifecycle/index.md",
  "docs/User Guide/get_started/b2b_use_cases/account_based_segmentation/index.md",
  "docs/User Guide/get_started/b2b_use_cases/b2b_data_models/index.md",
  "docs/User Guide/get_started/b2b_use_cases/b2b_salesforce_sales_cloud/index.md",
  "docs/User Guide/get_started/b2b_use_cases/lead_scoring/index.md",
  "docs/User Guide/get_started/braze_pilot/data_dictionary/index.md",
  "docs/User Guide/get_started/braze_pilot/deep_links/index.md",
  "docs/User Guide/get_started/braze_pilot/getting_started/index.md",
  "docs/User Guide/get_started/braze_pilot/index.md",
  "docs/User Guide/get_started/campaigns_and_canvases/index.md",
  "docs/User Guide/get_started/index.md",
  "docs/User Guide/get_started/integrations/index.md",
  "docs/User Guide/get_started/sdk_overview/index.md",
  "docs/User Guide/get_started/users_and_segments/index.md",
  "docs/User Guide/get_started/workspaces/index.md",
  "docs/User Guide/messaging/ab_testing/analytics/index.md",
  "docs/User Guide/messaging/ab_testing/concepts/conversion_correlation/index.md",
  "docs/User Guide/messaging/ab_testing/concepts/race_conditions/index.md",
  "docs/User Guide/messaging/ab_testing/concepts/random_bucket_numbers/index.md",
  "docs/User Guide/messaging/ab_testing/concepts/variant_distribution/index.md",
  "docs/User Guide/messaging/ab_testing/create_tests/index.md",
  "docs/User Guide/messaging/ab_testing/faq/index.md",
  "docs/User Guide/messaging/ab_testing/index.md",
  "docs/User Guide/messaging/ab_testing/optimizations/index.md",
  "docs/User Guide/messaging/campaigns/campaign_basics/index.md",
  "docs/User Guide/messaging/campaigns/creating_campaign/index.md",
  "docs/User Guide/messaging/campaigns/faq/index.md",
  "docs/User Guide/messaging/campaigns/ideas_and_strategies/active_user_campaigns/index.md",
  "docs/User Guide/messaging/campaigns/ideas_and_strategies/add_to_calendar_links/index.md",
  "docs/User Guide/messaging/campaigns/ideas_and_strategies/best_practices/index.md",
  "docs/User Guide/messaging/campaigns/ideas_and_strategies/booking_use_case/index.md",
  "docs/User Guide/messaging/campaigns/ideas_and_strategies/capturing_lapsing_users/index.md",
  "docs/User Guide/messaging/campaigns/ideas_and_strategies/install_attribution/index.md",
  "docs/User Guide/messaging/campaigns/ideas_and_strategies/new_features/index.md",
  "docs/User Guide/messaging/campaigns/ideas_and_strategies/retargeting_campaigns/index.md",
  "docs/User Guide/messaging/campaigns/ideas_and_strategies/zoom/index.md",
  "docs/User Guide/messaging/campaigns/manage_campaigns/campaign_alerts/index.md",
  "docs/User Guide/messaging/campaigns/manage_campaigns/change_your_campaign_after_launch/index.md",
  "docs/User Guide/messaging/campaigns/manage_campaigns/search_campaigns/index.md",
  "docs/User Guide/messaging/campaigns/schedule_your_campaign/api_triggered_delivery/index.md",
  "docs/User Guide/messaging/campaigns/schedule_your_campaign/campaign_calendar/index.md",
  "docs/User Guide/messaging/campaigns/schedule_your_campaign/scheduled_delivery/index.md",
  "docs/User Guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/attribute_triggers/index.md",
  "docs/User Guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/campaign_connector/index.md",
  "docs/User Guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/index.md",
  "docs/User Guide/messaging/campaigns/test_campaigns/triggered_action_based/index.md",
  "docs/User Guide/messaging/canvas/canvas_basics/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/action_paths/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/agent_step/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/audience_paths/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/content_optimizer_step/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/context/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/decision_split/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/delay_step/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/experiment_step/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/experiment_step/personalized_paths/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/experiment_step/winning_path/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/feature_flags/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/message_step/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/send_to_destination/index.md",
  "docs/User Guide/messaging/canvas/canvas_components/user_update/index.md",
  "docs/User Guide/messaging/canvas/create_a_canvas/canvas_by_channel/content-cards_in_canvas/index.md",
  "docs/User Guide/messaging/canvas/create_a_canvas/canvas_by_channel/in-app_messages_in_canvas/index.md",
  "docs/User Guide/messaging/canvas/create_a_canvas/canvas_comments/index.md",
  "docs/User Guide/messaging/canvas/create_a_canvas/context_and_event_properties/canvas_persistent_entry_properties/index.md",
  "docs/User Guide/messaging/canvas/create_a_canvas/context_and_event_properties/index.md",
  "docs/User Guide/messaging/canvas/create_a_canvas/exit_criteria/index.md",
  "docs/User Guide/messaging/canvas/create_a_canvas/index.md",
  "docs/User Guide/messaging/canvas/faqs/index.md",
  "docs/User Guide/messaging/canvas/ideas_and_strategies/best_practices/index.md",
  "docs/User Guide/messaging/canvas/ideas_and_strategies/booking_use_case/index.md",
  "docs/User Guide/messaging/canvas/ideas_and_strategies/canvas_outlines/index.md",
  "docs/User Guide/messaging/canvas/ideas_and_strategies/ecommerce_use_cases/index.md",
  "docs/User Guide/messaging/canvas/ideas_and_strategies/launching_canvas_flow/index.md",
  "docs/User Guide/messaging/canvas/ideas_and_strategies/matching_entry_and_exit_criteria/index.md",
  "docs/User Guide/messaging/canvas/ideas_and_strategies/pre_post_launch_checklist/index.md",
  "docs/User Guide/messaging/canvas/managing_canvases/canvas_drafts/index.md",
  "docs/User Guide/messaging/canvas/managing_canvases/canvas_version_history/index.md",
  "docs/User Guide/messaging/canvas/managing_canvases/change_your_canvas_after_launch/index.md",
  "docs/User Guide/messaging/canvas/managing_canvases/cloning_canvases/index.md",
  "docs/User Guide/messaging/canvas/testing_canvases/measuring_and_testing_with_canvas_analytics/index.md",
  "docs/User Guide/messaging/canvas/testing_canvases/preview_user_paths/index.md",
  "docs/User Guide/messaging/canvas/testing_canvases/sending_test_canvases/index.md",
  "docs/User Guide/messaging/canvas/troubleshooting/index.md",
  "docs/User Guide/messaging/design_and_edit/content_blocks/index.md",
  "docs/User Guide/messaging/design_and_edit/editor_blocks/index.md",
  "docs/User Guide/messaging/design_and_edit/media_library/faq/index.md",
  "docs/User Guide/messaging/design_and_edit/media_library/image_specifications/index.md",
  "docs/User Guide/messaging/design_and_edit/media_library/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/actions_and_media_urls/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/connected_content/aborting_connected_content/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/connected_content/caching_responses/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/connected_content/connected_content_retries/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/connected_content/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/connected_content/local_connected_content_variables/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/connected_content/making_an_api_call/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/connected_content/public_apis/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/connected_content/troubleshooting_webhooks_and_connected_content/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/connected_content/user_profile_fields_connected_content/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/dashboard_tools/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/aborting_messages/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/advanced_filters/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/advanced_filters/message_extras/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/conditional_logic/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/faq/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/filters/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/liquid_use_cases/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/operators/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/setting_default_values/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/supported_personalization_tags/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/tutorials/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/liquid/using_liquid/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/campaign_and_canvas_attributes_across_sources/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/canvas_entry_properties/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/catalog/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/context_variables/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/key_value_pairs/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/promotion_codes/create/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/promotion_codes/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/promotion_codes/manage/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/promotion_codes/migrating_from_data_feeds/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/rest_api/index.md",
  "docs/User Guide/messaging/design_and_edit/personalize/sources/user_profile/index.md",
  "docs/User Guide/messaging/design_and_edit/product_blocks/index.md",
  "docs/User Guide/messaging/feature_flags/create_feature_flags/index.md",
  "docs/User Guide/messaging/feature_flags/faq/index.md",
  "docs/User Guide/messaging/feature_flags/feature_flag_experiments/index.md",
  "docs/User Guide/messaging/feature_flags/index.md",
  "docs/User Guide/messaging/governance/approvals/index.md",
  "docs/User Guide/messaging/governance/approvals/messaging_rules/index.md",
  "docs/User Guide/messaging/governance/archiving/index.md",
  "docs/User Guide/messaging/governance/copy_across_workspaces/index.md",
  "docs/User Guide/messaging/governance/duplicating/index.md",
  "docs/User Guide/messaging/governance/statuses/index.md",
  "docs/User Guide/messaging/governance/tags/index.md",
  "docs/User Guide/messaging/landing_pages/about_tracking_data/index.md",
  "docs/User Guide/messaging/landing_pages/create_landing_pages/index.md",
  "docs/User Guide/messaging/landing_pages/customize_the_url/index.md",
  "docs/User Guide/messaging/landing_pages/index.md",
  "docs/User Guide/messaging/landing_pages/personalize_landing_pages/index.md",
  "docs/User Guide/messaging/landing_pages/retargeting_users/index.md",
  "docs/User Guide/messaging/landing_pages/tracking_users/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/accessibility/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/conversion_events/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/delivery_and_entry_types/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/dispatch_id/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/frequency_capping/faq/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/frequency_capping/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/know_before_you_send/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/localization/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/localization/locales_in_messages/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/localization/right_to_left_messages/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/quiet_hours/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/re_eligibility/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/sending_test_messages/index.md",
  "docs/User Guide/messaging/messaging_fundamentals/target_users/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/braze_templates/abandoned_cart/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/braze_templates/back_in_stock/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/braze_templates/email_signup/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/braze_templates/feature_adoption/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/braze_templates/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/braze_templates/lapsed_user/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/braze_templates/onboarding/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/braze_templates/post_purchase_feedback/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/braze_templates/preference_survey/index.md",
  "docs/User Guide/messaging/templates/canvas_templates/index.md",
  "docs/User Guide/messaging/templates/email_templates/email_template/index.md",
  "docs/User Guide/messaging/templates/email_templates/faq/index.md",
  "docs/User Guide/messaging/templates/email_templates/html_email_template/index.md",
  "docs/User Guide/messaging/templates/email_templates/index.md",
  "docs/User Guide/messaging/templates/email_templates/link_aliasing/index.md",
  "docs/User Guide/messaging/templates/email_templates/link_template/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/email_capture/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/email_confirmation_page/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/email_discount/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/email_image/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/email_offer/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/in_app_message_template/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/onboarding/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/phone_number_capture/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/product_announcement/index.md",
  "docs/User Guide/messaging/templates/in_app_message_templates/seasonal_promo/index.md",
  "docs/User Guide/messaging/templates/managing_templates/index.md",
  "docs/User Guide/messaging/templates/webhook_templates/index.md",
  "docs/User Guide/privacy_portal/index.md"
];

const PREPOPULATED_DOCS: Record<string, string> = {
  "docs/User Guide/administer/global/user_management/permissions/index.md": `# User Permissions & Enterprise Access Control

Braze provides robust, workspace-level role permissions to safeguard your customer communication workflows. Each account administrator can provision specific authorization tiers to maintain governance and cross-department security.

## Standard Roles
- **Workspace Administrator**: Unrestricted read/write capabilities across segments, campaigns, API keys, exports, and integrations. Administrators can delete profiles, configure SAML, and manage permissions.
- **Editor**: Full creation access. Can draft, run, and modify segments, campaigns, templates, but cannot manage billing or workspace-level preferences.
- **Viewer / Reader**: Strictly read-only access. Helpful for analysts and product managers checking active analytics or existing campaign structures.
- **Custom / Team Roles**: Enterprise accounts can leverage fine-grained access criteria (e.g., restrict SMS sending to a regional marketing squad).

## Compliance & Security Guidelines
- Restrict S3 export configurations to S3 Export Admin credentials.
- Periodically prune unused API credentials with write permission.
- Ensure automated user provisioning uses SCIM protocols.
`,

  "docs/User Guide/channels/email/email_setup/authentication/index.md": `# Email Setup: Authenticators & Security Keys

Ensuring clean deliverability begins with establishing correct sender signatures. Braze emails require custom DKIM, SPF, and DMARC parameters to bypass modern mailbox filters and secure domain reputation.

## Deliverability Fundamentals
1. **SPF (Sender Policy Framework)**: A standard DNS TXT record determining which servers are authorized to send marketing and transactional email on your domain's behalf.
2. **DKIM (DomainKeys Identified Mail)**: Cryptographically binds your brand's digital signature to outgoing mail, verifying the header content has not been tampered with.
3. **DMARC (Domain-based Message Authentication, Reporting, and Conformance)**: Coordinates SPF and DKIM behavior. A healthy rule is \`v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com\` mapping automatic reports of abuse.

## Automated IP Warming Schedules
For newly provisioned IP addresses, a graduated volume cadence is requested:
- **Week 1**: Maximum 50,000 messages daily, focused on highly engaged segments.
- **Week 2**: 100,000 daily messages.
- **Week 3**: Incremental doubling hasta reaching full operational targets.
`,

  "docs/User Guide/brazeai/agents/creating_agents/index.md": `# Creating AI Decisioning Agents

Braze AI empowers companies to coordinate dynamic campaign orchestration, messaging timing, and channel routing.

## AI Agent Configuration Steps
1. **Define Core System Instructions**: Establish bounds on standard brand terms, tone of voice, copy guidelines, and target segments.
2. **Setup Connective Data Streams**: Ground your AI's decisioning logic on historical behavior profiles, CDI segments, and catalogs.
3. **Establish Orchestration Rules**: Determine whether the agent should operate on intelligent-timing constraints, or dynamically route users between Email, SMS, or Push.
4. **Deploy evaluation loops**: Verify agent analytics metrics continuously under the Diagnostics dashboard.

## Precautions for Internal Productivity Prototype
- Do not ingest private or sandbox customer records.
- Ensure read-only GET parameters are verified before connecting third-party platforms.
`,

  "docs/User Guide/data/activation/attributes/custom_attributes/index.md": `# Custom Attributes & State Schemas

Attributes represent the state of your audience profiles. Braze supports multiple data types for flexible user targeting.

## Supported Schema Types
- **String**: Exact text values, perfect for regional attributes or referral codes.
- **Boolean**: Yes/No states, optimal for opt-ins or current plan status.
- **Number**: Integers or floats to track lifetime spend or credit balances.
- **Array of Objects**: Allows grouping complex transactional items (e.g., purchased packages) directly inside the profile.
- **Nested Custom Attributes**: JSON objects representing multi-tier data structures (e.g., user preferences).

## Data Points and Calculation Governance
Every attribute write consumes a data point. Please apply blocklists over unneeded telemetry keys, and follow uniform kebab-case or snake_case conventions.
`,

  "docs/User Guide/messaging/canvas/canvas_basics/index.md": `# Braze Canvas: Journey Orchestration Fundamentals

Canvas is Braze's visual builder for orchestrating cohesive customer journeys across multi-channel touchpoints.

## Strategic Ingredients
- **Entry Step**: Triggers standard user progression. Can be Action-based, Scheduled, API Triggered, or Segment-membership based.
- **Action Paths**: Dynamically fork the audience into branches depending on what action they take next (e.g. clicked, opened, dismissed).
- **Delay Steps**: Create calendar intervals (e.g., Wait 3 Days) or specify dynamic timing guidelines.
- **Content Optimizer**: Implements multi-variant split-testing, keeping winner cadences for late entrants automatically.
- **Exit Criteria**: Instantly ejects customers who satisfy conversion actions (such as purchasing a subscription).
`,

  "docs/User Guide/channels/sms_mms_and_rcs/message_setup/subscription_groups/index.md": `# SMS Subscription Groups & Compliance

Establish opt-in compliance across text marketing campaigns by utilizing specialized mobile groups.

## Compliance Protocols
1. **Explicit Opt-In Required**: Ensure users provide written consent prior to being appended to promotional subscription groups.
2. **Standard Keyword Triggers**:
   - **START / YES**: Confirms subscriber entry and triggers standard welcome messaging.
   - **STOP / QUIT**: Automatically updates subscription status to Opted-Out, silencing further pushes.
   - **HELP / INFO**: Delivers support contact metrics and custom legal links.
3. **Geographical Guardrails**: Support US-based 10DLC registrations, and respect EU spam governance limits.
`
};

export function checkAndPrepopulate() {
  const mdDir = path.join(process.cwd(), "braze_user_guide_md");
  
  // 1. Ensure OUT_DIR exists
  if (!fs.existsSync(mdDir)) {
    fs.mkdirSync(mdDir, { recursive: true });
  }

  // 2. Populate the default Markdown files
  Object.entries(PREPOPULATED_DOCS).forEach(([relativeFilePath, content]) => {
    const fullPath = path.join(mdDir, relativeFilePath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content.trim(), "utf-8");
    }
  });

  // 3. Create manifest.csv if it doesn't exist
  const manifestPath = path.join(process.cwd(), "braze_user_guide_manifest.csv");
  if (!fs.existsSync(manifestPath)) {
    const rows = ALL_DOC_PATHS.map((docPath) => {
      const filename = path.basename(docPath);
      const relative = docPath.replace("docs/User Guide/", "");
      const section = relative.split("/")[0] || "root";
      const localPath = `braze_user_guide_md/${docPath}`;
      const isDownloaded = PREPOPULATED_DOCS[docPath] !== undefined;
      const sha = isDownloaded ? "local-prepopulated-sha" : "";
      const rawUrl = `https://raw.githubusercontent.com/braze-inc/release-notes/main/${docPath}`;
      const lastSynced = new Date().toISOString();

      return `"${docPath}","${rawUrl}","${sha}","${localPath}","${filename}","${section}","${lastSynced}"`;
    });

    const header = "github_path,raw_url,sha,local_path,filename,section,last_synced_at\n";
    fs.writeFileSync(manifestPath, header + rows.join("\n"), "utf-8");
  }

  // 4. Create state.json if it doesn't exist
  const statePath = path.join(process.cwd(), "braze_user_guide_state.json");
  if (!fs.existsSync(statePath)) {
    const state: Record<string, any> = {};
    ALL_DOC_PATHS.forEach((docPath) => {
      const isDownloaded = PREPOPULATED_DOCS[docPath] !== undefined;
      state[docPath] = {
        sha: isDownloaded ? "local-prepopulated-sha" : "",
        raw_url: `https://raw.githubusercontent.com/braze-inc/release-notes/main/${docPath}`,
        local_path: `braze_user_guide_md/${docPath}`,
        filename: path.basename(docPath),
        section: docPath.replace("docs/User Guide/", "").split("/")[0] || "root",
        last_synced_at: new Date().toISOString(),
      };
    });
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
  }
}

export function searchAndGetRAGContext(query: string, limit = 4): { context: string, sources: string[] } {
  const mdDir = path.join(process.cwd(), "braze_user_guide_md");
  if (!fs.existsSync(mdDir)) {
    return { context: "", sources: [] };
  }

  // Simple local keyword-based search over the prepopulated (and any other synced) files
  const searchResults: { path: string, content: string, score: number }[] = [];
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  function walk(dir: string, baseDir: string) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        walk(fullPath, baseDir);
      } else if (file.endsWith(".md")) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        const githubPath = relativePath.startsWith("docs/User Guide/") ? relativePath : `docs/User Guide/${relativePath}`;
        const content = fs.readFileSync(fullPath, "utf-8");
        const lowerContent = content.toLowerCase();
        
        let score = 0;
        queryTerms.forEach(term => {
          // Term occurrences weight
          const occurrences = lowerContent.split(term).length - 1;
          score += occurrences * 10;
          // Title weight
          if (relativePath.toLowerCase().includes(term)) {
            score += 100;
          }
        });

        if (score > 0 || queryTerms.length === 0) {
          searchResults.push({ path: githubPath, content, score });
        }
      }
    });
  }

  walk(mdDir, mdDir);

  // Sort by score descending
  searchResults.sort((a, b) => b.score - a.score);

  const topResults = searchResults.slice(0, limit);
  const contextParts: string[] = [];
  const sources: string[] = [];

  topResults.forEach(res => {
    contextParts.push(`SOURCE FILE PATH: ${res.path}\n---\n${res.content}\n---`);
    sources.push(res.path);
  });

  return {
    context: contextParts.join("\n\n"),
    sources
  };
}
